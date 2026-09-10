import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity({ name: 'treinadores' })
export class Treinador {
  @PrimaryGeneratedColumn({ name: 'id_treinador', type: 'bigint' })
  idTreinador!: string;
  @Column({ name: 'id_usuario', type: 'bigint' }) idUsuario!: string;
  @Column({
    name: 'nome_profissional',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  nomeProfissional!: string | null;
  @Column({ type: 'varchar', length: 50, nullable: true })
  cref!: string | null;
  @Column({ type: 'text', nullable: true }) bio!: string | null;
  @Column({ type: 'boolean', default: false }) ativo!: boolean;
}
