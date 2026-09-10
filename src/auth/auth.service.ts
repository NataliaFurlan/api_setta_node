import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aluno } from '../database/entities/aluno.entity';
import { Treinador } from '../database/entities/treinador.entity';
import { TipoUsuario, Usuario } from '../database/entities/usuario.entity';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
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
  ) {}
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
