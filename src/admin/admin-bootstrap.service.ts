import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordService } from '../auth/password.service';
import { TipoUsuario, Usuario } from '../database/entities/usuario.entity';

@Injectable()
export class AdminBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminBootstrapService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly passwords: PasswordService,
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
  ) {}

  async onApplicationBootstrap() {
    const password = this.config.get<string>('ADMIN_INITIAL_PASSWORD');
    if (!password) return;
    const email = this.config.get<string>('ADMIN_EMAIL')?.trim().toLowerCase();
    const nome =
      this.config.get<string>('ADMIN_NAME')?.trim() || 'Natalia Furlan';
    if (!email || password.length < 12)
      throw new Error(
        'ADMIN_EMAIL e uma ADMIN_INITIAL_PASSWORD de pelo menos 12 caracteres são obrigatórios para inicializar a administradora.',
      );

    const existing = await this.usuarios.findOneBy({ email });
    if (existing && existing.tipoUsuario !== TipoUsuario.ADMIN)
      throw new Error(
        'ADMIN_EMAIL já pertence a uma conta que não é administrativa.',
      );

    await this.usuarios.save(
      this.usuarios.create({
        ...existing,
        nome,
        email,
        senhaHash: await this.passwords.encode(password),
        tipoUsuario: TipoUsuario.ADMIN,
        ativo: true,
        versaoSessao: (existing?.versaoSessao ?? 0) + 1,
      }),
    );
    this.logger.warn(
      `Administradora ${email} criada ou atualizada. Remova ADMIN_INITIAL_PASSWORD e reimplante a aplicação.`,
    );
  }
}
