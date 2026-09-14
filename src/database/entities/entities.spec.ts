import { DataSource } from 'typeorm';
import { Aluno } from './aluno.entity';
import { Treinador } from './treinador.entity';
import { Usuario } from './usuario.entity';
import { LogAdministrativo } from './log-administrativo.entity';
import { ConviteAluno } from './convite-aluno.entity';
import { EmailEnvio } from './email-envio.entity';

describe('Entidades MySQL', () => {
  it('possui metadados de colunas suportados pelo driver', async () => {
    const dataSource = new DataSource({
      type: 'mysql',
      database: 'setta_test',
      entities: [
        Usuario,
        Treinador,
        Aluno,
        LogAdministrativo,
        ConviteAluno,
        EmailEnvio,
      ],
    });

    const metadataBuilder = dataSource as unknown as {
      buildMetadatas(): Promise<void>;
    };

    await expect(metadataBuilder.buildMetadatas()).resolves.toBeUndefined();
  });
});
