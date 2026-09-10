import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../app.module';
import { PasswordService } from '../auth/password.service';
import { TipoUsuario, Usuario } from '../database/entities/usuario.entity';

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || 'Natalia Furlan';
  if (!email || !password || password.length < 12)
    throw new Error(
      'Defina ADMIN_EMAIL e ADMIN_INITIAL_PASSWORD com pelo menos 12 caracteres.',
    );

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  try {
    const users = app.get<Repository<Usuario>>(getRepositoryToken(Usuario));
    const passwords = app.get(PasswordService);
    const existing = await users.findOneBy({ email });
    if (existing && existing.tipoUsuario !== TipoUsuario.ADMIN)
      throw new Error(
        'O e-mail informado já pertence a uma conta que não é administrativa.',
      );
    await users.save(
      users.create({
        ...existing,
        nome: name,
        email,
        senhaHash: await passwords.encode(password),
        tipoUsuario: TipoUsuario.ADMIN,
        ativo: true,
        versaoSessao: (existing?.versaoSessao ?? 0) + 1,
      }),
    );
    console.log(`Administrador ${email} criado ou atualizado com sucesso.`);
  } finally {
    await app.close();
  }
}

void createAdmin().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
