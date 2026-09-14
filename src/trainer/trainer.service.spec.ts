import { ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { PasswordService } from '../auth/password.service';
import { Aluno } from '../database/entities/aluno.entity';
import {
  ConviteAluno,
  StatusConviteAluno,
} from '../database/entities/convite-aluno.entity';
import { Treinador } from '../database/entities/treinador.entity';
import { Usuario } from '../database/entities/usuario.entity';
import { MailService } from '../mail/mail.service';
import { TrainerService } from './trainer.service';

function makeService(transaction: DataSource['transaction']) {
  return new TrainerService(
    {} as Repository<Treinador>,
    {} as Repository<Aluno>,
    {} as Repository<Usuario>,
    {} as Repository<ConviteAluno>,
    { encode: jest.fn() } as unknown as PasswordService,
    {} as ConfigService,
    { transaction } as DataSource,
    {} as MailService,
  );
}

describe('TrainerService.acceptInvite', () => {
  it('informa conflito quando o celular do convite já pertence a uma conta', async () => {
    const manager = {
      findOneBy: jest.fn(
        (entity: unknown, criteria: Record<string, unknown>) => {
          if (entity === ConviteAluno)
            return Promise.resolve({
              email: 'aluno@setta.test',
              telefone: '41999999999',
              status: StatusConviteAluno.PENDENTE,
            });
          if (entity === Usuario && 'email' in criteria)
            return Promise.resolve(null);
          return Promise.resolve({ idUsuario: 'existente' });
        },
      ),
      save: jest.fn(),
    };
    const service = makeService(((run: (value: unknown) => unknown) =>
      Promise.resolve(run(manager))) as DataSource['transaction']);

    await expect(
      service.acceptInvite('token', { senha: 'Senha123' }),
    ).rejects.toThrow(
      'Este celular já possui uma conta. Peça um novo convite sem esse número ou com outro celular.',
    );
    expect(manager.save).not.toHaveBeenCalled();
  });

  it('converte colisão concorrente do banco em conflito de cadastro', async () => {
    const databaseError = new QueryFailedError('INSERT INTO usuarios', [], {
      code: 'ER_DUP_ENTRY',
      sqlMessage:
        "Duplicate entry '41999999999' for key 'uq_usuarios_telefone'",
    });
    const service = makeService(() => Promise.reject(databaseError));

    await expect(
      service.acceptInvite('token', { senha: 'Senha123' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
