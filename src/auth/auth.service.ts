import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Aluno } from '../database/entities/aluno.entity';
import { Treinador } from '../database/entities/treinador.entity';
import { TipoUsuario, Usuario } from '../database/entities/usuario.entity';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { CadastroTreinadorDto } from './dto/cadastro-treinador.dto';
import { CadastroTreinadorResponseDto } from './dto/cadastro-treinador-response.dto';
import { PasswordService } from './password.service';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    @InjectRepository(Treinador)
    private readonly treinadores: Repository<Treinador>,
    @InjectRepository(Aluno) private readonly alunos: Repository<Aluno>,
    private readonly passwords: PasswordService,
    private readonly jwt: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  async cadastrarTreinador(
    dto: CadastroTreinadorDto,
  ): Promise<CadastroTreinadorResponseDto> {
    const existente = await this.usuarios
      .createQueryBuilder('usuario')
      .where('LOWER(usuario.email) = :email', { email: dto.email })
      .getExists();
    if (existente) throw new ConflictException('E-mail já cadastrado');

    await this.dataSource.transaction(async (manager) => {
      const usuario = await manager.save(
        manager.create(Usuario, {
          nome: dto.nome.trim(),
          email: dto.email,
          senhaHash: await this.passwords.encode(dto.senha),
          telefone: dto.telefone?.trim() || null,
          tipoUsuario: TipoUsuario.TREINADOR,
          ativo: false,
        }),
      );
      await manager.save(
        manager.create(Treinador, {
          idUsuario: usuario.idUsuario,
          nomeProfissional: dto.nomeProfissional?.trim() || null,
          cref: dto.cref?.trim() || null,
          bio: dto.bio?.trim() || null,
          ativo: false,
        }),
      );
    });
    return {
      status: 'PENDENTE_APROVACAO',
      mensagem: 'Cadastro enviado para análise.',
    };
  }
  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const usuario = await this.usuarios
      .createQueryBuilder('usuario')
      .addSelect('usuario.senhaHash')
      .where('LOWER(usuario.email) = :email', { email: dto.login })
      .getOne();
    if (
      !usuario ||
      !usuario.ativo ||
      !(await this.passwords.matches(dto.senha, usuario.senhaHash))
    )
      throw new UnauthorizedException('Login ou senha inválidos');
    if (this.passwords.needsUpgrade(usuario.senhaHash))
      await this.usuarios.update(usuario.idUsuario, {
        senhaHash: await this.passwords.encode(dto.senha),
      });
    const idPerfil = await this.findProfileId(usuario);
    const token = await this.jwt.signAsync({
      sub: usuario.email,
      idUsuario: usuario.idUsuario,
      tipoUsuario: usuario.tipoUsuario,
    });
    return {
      token,
      tipo: usuario.tipoUsuario,
      idUsuario: usuario.idUsuario,
      idPerfil,
      nome: usuario.nome,
    };
  }
  private async findProfileId(usuario: Usuario) {
    if (usuario.tipoUsuario === TipoUsuario.TREINADOR) {
      const perfil = await this.treinadores.findOneBy({
        idUsuario: usuario.idUsuario,
      });
      if (perfil) return perfil.idTreinador;
    } else {
      const perfil = await this.alunos.findOneBy({
        idUsuario: usuario.idUsuario,
      });
      if (perfil) return perfil.idAluno;
    }
    throw new UnauthorizedException('Perfil de usuário inválido');
  }
}
