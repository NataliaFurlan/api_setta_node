import { DataSource } from 'typeorm';
import { Aluno } from './aluno.entity';
import { Treinador } from './treinador.entity';
import { Usuario } from './usuario.entity';

describe('Entidades MySQL', () => {
  it('possui metadados de colunas suportados pelo driver', async () => {
    const dataSource = new DataSource({
      type: 'mysql',
      database: 'setta_test',
      entities: [Usuario, Treinador, Aluno],
    });

    const metadataBuilder = dataSource as unknown as {
      buildMetadatas(): Promise<void>;
    };

    await expect(metadataBuilder.buildMetadatas()).resolves.toBeUndefined();
  });
});
