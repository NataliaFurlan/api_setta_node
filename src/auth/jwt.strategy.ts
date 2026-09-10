import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { TipoUsuario, Usuario } from '../database/entities/usuario.entity';
type JwtPayload = { sub: string; idUsuario: string; tipoUsuario: TipoUsuario };
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
      usuario.email.toLowerCase() !== payload.sub.toLowerCase()
    )
      throw new UnauthorizedException();
    return payload;
  }
}
