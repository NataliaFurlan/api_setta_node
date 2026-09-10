import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { TipoUsuario, Usuario } from '../database/entities/usuario.entity';
export type JwtPayload = {
  sub: string;
  idUsuario: string;
  tipoUsuario: TipoUsuario;
  versaoSessao: number;
};
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }
  async validate(payload: JwtPayload) {
    const usuario = await this.usuarios.findOneBy({
      idUsuario: payload.idUsuario,
    });
    if (
      !usuario?.ativo ||
      usuario.versaoSessao !== payload.versaoSessao ||
      usuario.email.toLowerCase() !== payload.sub.toLowerCase()
    )
      throw new UnauthorizedException();
    return payload;
  }
}
