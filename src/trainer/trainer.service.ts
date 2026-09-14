import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { DataSource, MoreThan, Repository } from 'typeorm';
import { PasswordService } from '../auth/password.service';
import { Aluno } from '../database/entities/aluno.entity';
import {
  ConviteAluno,
  StatusConviteAluno,
} from '../database/entities/convite-aluno.entity';
import { Treinador } from '../database/entities/treinador.entity';
import { TipoUsuario, Usuario } from '../database/entities/usuario.entity';
import { AcceptStudentInviteDto } from './dto/accept-student-invite.dto';
import { CreateStudentInviteDto } from './dto/create-student-invite.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class TrainerService {
  constructor(
    @InjectRepository(Treinador)
    private readonly trainers: Repository<Treinador>,
    @InjectRepository(Aluno) private readonly students: Repository<Aluno>,
    @InjectRepository(Usuario) private readonly users: Repository<Usuario>,
    @InjectRepository(ConviteAluno)
    private readonly invites: Repository<ConviteAluno>,
    private readonly passwords: PasswordService,
    private readonly config: ConfigService,
    private readonly dataSource: DataSource,
    private readonly mail: MailService,
  ) {}
  async dashboard(idUsuario: string) {
    const trainer = await this.trainers.findOneByOrFail({ idUsuario });
    const totalAlunos = await this.students.countBy({
      idTreinador: trainer.idTreinador,
    });
    return {
      totalAlunos,
      treinosAtivos: 0,
      solicitacoesPendentes: 0,
      fichasParaRevisar: 0,
    };
  }
  async studentsList(idUsuario: string) {
    const trainer = await this.trainers.findOneByOrFail({ idUsuario });
    return this.students
      .createQueryBuilder('aluno')
      .innerJoin(Usuario, 'usuario', 'usuario.idUsuario = aluno.idUsuario')
      .select([
        'aluno.idAluno AS idAluno',
        'usuario.nome AS nome',
        'usuario.email AS email',
        'usuario.telefone AS telefone',
        'usuario.ativo AS ativo',
      ])
      .where('aluno.idTreinador = :idTreinador', {
        idTreinador: trainer.idTreinador,
      })
      .orderBy('usuario.nome', 'ASC')
      .getRawMany<{
        idAluno: string;
        nome: string;
        email: string;
        telefone: string | null;
        ativo: boolean;
      }>();
  }
  async student(idUsuario: string, idAluno: string) {
    const trainer = await this.trainers.findOneByOrFail({ idUsuario });
    const student = await this.students
      .createQueryBuilder('aluno')
      .innerJoin(Usuario, 'usuario', 'usuario.idUsuario = aluno.idUsuario')
      .select([
        'aluno.idAluno AS idAluno',
        'usuario.nome AS nome',
        'usuario.email AS email',
        'usuario.telefone AS telefone',
        'usuario.ativo AS ativo',
        'usuario.criadoEm AS criadoEm',
      ])
      .where('aluno.idAluno = :idAluno', { idAluno })
      .andWhere('aluno.idTreinador = :idTreinador', {
        idTreinador: trainer.idTreinador,
      })
      .getRawOne<{
        idAluno: string;
        nome: string;
        email: string;
        telefone: string | null;
        ativo: boolean;
        criadoEm: Date;
      }>();
    if (!student) throw new NotFoundException('Aluno não encontrado.');
    return student;
  }
  async createInvite(idUsuario: string, dto: CreateStudentInviteDto) {
    const trainer = await this.trainers.findOneByOrFail({ idUsuario });
    const email = dto.email.trim().toLowerCase();
    if (
      await this.users
        .createQueryBuilder('u')
        .where('LOWER(u.email) = :email', { email })
        .getExists()
    )
      throw new ConflictException('Este e-mail já possui uma conta.');
    const existing = await this.invites.findOneBy({
      idTreinador: trainer.idTreinador,
      email,
      status: StatusConviteAluno.PENDENTE,
    });
    if (existing) existing.status = StatusConviteAluno.REVOGADO;
    if (existing) await this.invites.save(existing);
    const token = randomBytes(32).toString('base64url');
    const invite = await this.invites.save(
      this.invites.create({
        idTreinador: trainer.idTreinador,
        nome: dto.nome.trim(),
        email,
        telefone: dto.telefone?.trim() || null,
        tokenHash: this.hash(token),
        status: StatusConviteAluno.PENDENTE,
        expiraEm: new Date(Date.now() + 48 * 60 * 60 * 1000),
      }),
    );
    const portal =
      this.config.get<string>('PORTAL_URL') ||
      'https://admin-setta.varten.com.br';
    const link = `${portal}/convite/${token}`;
    const delivery = await this.sendStudentInvite({
      nome: invite.nome,
      email: invite.email,
      trainerName: trainer.nomeProfissional || 'seu treinador',
      link,
      expiration: invite.expiraEm,
    });
    return {
      idConvite: invite.idConvite,
      nome: invite.nome,
      email: invite.email,
      expiraEm: invite.expiraEm,
      link,
      emailStatus: delivery.status,
      idEmail: delivery.idEmail,
    };
  }
  async getInvite(token: string) {
    const invite = await this.invites.findOneBy({
      tokenHash: this.hash(token),
      status: StatusConviteAluno.PENDENTE,
      expiraEm: MoreThan(new Date()),
    });
    if (!invite) throw new NotFoundException('Convite inválido ou expirado.');
    return {
      nome: invite.nome,
      email: invite.email,
      expiraEm: invite.expiraEm,
    };
  }
  async acceptInvite(token: string, dto: AcceptStudentInviteDto) {
    const tokenHash = this.hash(token);
    await this.dataSource.transaction(async (manager) => {
      const invite = await manager.findOneBy(ConviteAluno, {
        tokenHash,
        status: StatusConviteAluno.PENDENTE,
        expiraEm: MoreThan(new Date()),
      });
      if (!invite)
        throw new BadRequestException('Convite inválido ou expirado.');
      if (await manager.findOneBy(Usuario, { email: invite.email }))
        throw new ConflictException('Este e-mail já possui uma conta.');
      const user = await manager.save(
        Usuario,
        manager.create(Usuario, {
          nome: invite.nome,
          email: invite.email,
          telefone: invite.telefone,
          senhaHash: await this.passwords.encode(dto.senha),
          tipoUsuario: TipoUsuario.ALUNO,
          ativo: true,
          versaoSessao: 0,
        }),
      );
      await manager.save(
        Aluno,
        manager.create(Aluno, {
          idUsuario: user.idUsuario,
          idTreinador: invite.idTreinador,
        }),
      );
      invite.status = StatusConviteAluno.ACEITO;
      invite.aceitoEm = new Date();
      await manager.save(invite);
    });
    return {
      message: 'Conta criada com sucesso. Você já pode entrar no Setta.',
    };
  }
  private hash(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private sendStudentInvite(data: {
    nome: string;
    email: string;
    trainerName: string;
    link: string;
    expiration: Date;
  }) {
    const escape = (value: string) =>
      value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');
    return this.mail.send({
      tipo: 'CONVITE_ALUNO',
      to: data.email,
      subject: `${data.trainerName} convidou você para o Setta`,
      text: [
        `Olá, ${data.nome}.`,
        `${data.trainerName} convidou você para acompanhar seus treinos no Setta.`,
        'Crie sua senha usando o link abaixo:',
        data.link,
        `O convite expira em ${data.expiration.toLocaleString('pt-BR')}.`,
      ].join('\n\n'),
      html: `<h2>Seu treino chegou ao Setta</h2><p>Olá, ${escape(data.nome)}.</p><p><strong>${escape(data.trainerName)}</strong> convidou você para acompanhar seus treinos no Setta.</p><p><a href="${escape(data.link)}" style="display:inline-block;padding:14px 22px;background:#101713;color:#d8ff57;text-decoration:none;border-radius:12px;font-weight:bold">Criar minha senha</a></p><p>Este convite é pessoal, pode ser usado uma única vez e expira em 48 horas.</p>`,
    });
  }
}
