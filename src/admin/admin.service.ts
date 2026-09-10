import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  AcaoAdministrativa,
  LogAdministrativo,
} from '../database/entities/log-administrativo.entity';
import {
  StatusTreinador,
  Treinador,
} from '../database/entities/treinador.entity';
import { Usuario } from '../database/entities/usuario.entity';
import {
  AcaoSuspensao,
  AlterarSuspensaoDto,
} from './dto/alterar-suspensao.dto';
import {
  DecisaoCadastro,
  RevisarTreinadorDto,
} from './dto/revisar-treinador.dto';

type TreinadorAdministrativo = {
  idTreinador: string;
  idUsuario: string;
  nome: string;
  email: string;
  telefone: string | null;
  nomeProfissional: string | null;
  cref: string | null;
  bio?: string | null;
  status: StatusTreinador;
  ativo?: boolean;
  criadoEm: Date;
  analisadoEm?: Date | null;
  justificativaAnalise?: string | null;
};

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Treinador)
    private readonly treinadores: Repository<Treinador>,
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    @InjectRepository(LogAdministrativo)
    private readonly logs: Repository<LogAdministrativo>,
    private readonly dataSource: DataSource,
  ) {}

  async dashboard() {
    const [pendentes, aprovados, suspensos, totalUsuarios, acoesRecentes] =
      await Promise.all([
        this.treinadores.countBy({ status: StatusTreinador.PENDENTE }),
        this.treinadores.countBy({ status: StatusTreinador.APROVADO }),
        this.treinadores.countBy({ status: StatusTreinador.SUSPENSO }),
        this.usuarios.count(),
        this.logs.count({ where: {}, take: 100 }),
      ]);
    return { pendentes, aprovados, suspensos, totalUsuarios, acoesRecentes };
  }

  listarTreinadores(status?: StatusTreinador) {
    const query = this.treinadores
      .createQueryBuilder('treinador')
      .innerJoin(Usuario, 'usuario', 'usuario.idUsuario = treinador.idUsuario')
      .select([
        'treinador.idTreinador AS idTreinador',
        'treinador.status AS status',
        'treinador.nomeProfissional AS nomeProfissional',
        'treinador.cref AS cref',
        'treinador.criadoEm AS criadoEm',
        'usuario.idUsuario AS idUsuario',
        'usuario.nome AS nome',
        'usuario.email AS email',
        'usuario.telefone AS telefone',
      ])
      .orderBy('treinador.criadoEm', 'DESC');
    if (status) query.where('treinador.status = :status', { status });
    return query.getRawMany<TreinadorAdministrativo>();
  }

  async obterTreinador(id: string) {
    const item = await this.treinadores
      .createQueryBuilder('treinador')
      .innerJoin(Usuario, 'usuario', 'usuario.idUsuario = treinador.idUsuario')
      .select([
        'treinador.idTreinador AS idTreinador',
        'treinador.status AS status',
        'treinador.nomeProfissional AS nomeProfissional',
        'treinador.cref AS cref',
        'treinador.bio AS bio',
        'treinador.justificativaAnalise AS justificativaAnalise',
        'treinador.analisadoEm AS analisadoEm',
        'treinador.criadoEm AS criadoEm',
        'usuario.idUsuario AS idUsuario',
        'usuario.nome AS nome',
        'usuario.email AS email',
        'usuario.telefone AS telefone',
        'usuario.ativo AS ativo',
      ])
      .where('treinador.idTreinador = :id', { id })
      .getRawOne<TreinadorAdministrativo>();
    if (!item) throw new NotFoundException('Treinador não encontrado.');
    return item;
  }

  async revisar(id: string, dto: RevisarTreinadorDto, idAdmin: string) {
    await this.dataSource.transaction(async (manager) => {
      const treinador = await manager.findOneBy(Treinador, { idTreinador: id });
      if (!treinador) throw new NotFoundException('Treinador não encontrado.');
      if (treinador.status !== StatusTreinador.PENDENTE)
        throw new BadRequestException(
          'Somente cadastros pendentes podem ser analisados.',
        );
      const aprovado = dto.decisao === DecisaoCadastro.APROVAR;
      const anterior = this.snapshot(treinador);
      treinador.status = aprovado
        ? StatusTreinador.APROVADO
        : StatusTreinador.REPROVADO;
      treinador.ativo = aprovado;
      treinador.justificativaAnalise = dto.justificativa.trim();
      treinador.analisadoEm = new Date();
      treinador.analisadoPor = idAdmin;
      await manager.save(treinador);
      await manager.update(Usuario, treinador.idUsuario, {
        ativo: aprovado,
        versaoSessao: () => 'versao_sessao + 1',
      });
      await manager.save(LogAdministrativo, {
        idAdmin,
        idUsuarioAlvo: treinador.idUsuario,
        acao: aprovado
          ? AcaoAdministrativa.APROVAR_TREINADOR
          : AcaoAdministrativa.REPROVAR_TREINADOR,
        justificativa: dto.justificativa.trim(),
        estadoAnterior: anterior,
        estadoNovo: this.snapshot(treinador),
      });
    });
    return this.obterTreinador(id);
  }

  async alterarSuspensao(
    id: string,
    dto: AlterarSuspensaoDto,
    idAdmin: string,
  ) {
    await this.dataSource.transaction(async (manager) => {
      const treinador = await manager.findOneBy(Treinador, { idTreinador: id });
      if (!treinador) throw new NotFoundException('Treinador não encontrado.');
      const suspender = dto.acao === AcaoSuspensao.SUSPENDER;
      if (suspender && treinador.status !== StatusTreinador.APROVADO)
        throw new BadRequestException(
          'Somente um treinador aprovado pode ser suspenso.',
        );
      if (!suspender && treinador.status !== StatusTreinador.SUSPENSO)
        throw new BadRequestException(
          'Somente um treinador suspenso pode ser reativado.',
        );
      const anterior = this.snapshot(treinador);
      treinador.status = suspender
        ? StatusTreinador.SUSPENSO
        : StatusTreinador.APROVADO;
      treinador.ativo = !suspender;
      treinador.justificativaAnalise = dto.justificativa.trim();
      treinador.analisadoEm = new Date();
      treinador.analisadoPor = idAdmin;
      await manager.save(treinador);
      await manager.update(Usuario, treinador.idUsuario, {
        ativo: !suspender,
        versaoSessao: () => 'versao_sessao + 1',
      });
      await manager.save(LogAdministrativo, {
        idAdmin,
        idUsuarioAlvo: treinador.idUsuario,
        acao: suspender
          ? AcaoAdministrativa.SUSPENDER_TREINADOR
          : AcaoAdministrativa.REATIVAR_TREINADOR,
        justificativa: dto.justificativa.trim(),
        estadoAnterior: anterior,
        estadoNovo: this.snapshot(treinador),
      });
    });
    return this.obterTreinador(id);
  }

  listarLogs() {
    return this.logs.find({ order: { criadoEm: 'DESC' }, take: 100 });
  }

  private snapshot(treinador: Treinador) {
    return { status: treinador.status, ativo: treinador.ativo };
  }
}
