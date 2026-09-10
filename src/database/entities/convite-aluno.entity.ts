import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum StatusConviteAluno {
  PENDENTE = 'PENDENTE',
  ACEITO = 'ACEITO',
  REVOGADO = 'REVOGADO',
}

@Entity({ name: 'convites_alunos' })
export class ConviteAluno {
  @PrimaryGeneratedColumn({ name: 'id_convite', type: 'bigint' })
  idConvite!: string;
  @Column({ name: 'id_treinador', type: 'bigint' }) idTreinador!: string;
  @Column({ length: 150 }) nome!: string;
  @Column({ length: 180 }) email!: string;
  @Column({ type: 'varchar', length: 30, nullable: true })
  telefone!: string | null;
  @Column({ name: 'token_hash', length: 64, unique: true }) tokenHash!: string;
  @Column({
    type: 'enum',
    enum: StatusConviteAluno,
    default: StatusConviteAluno.PENDENTE,
  })
  status!: StatusConviteAluno;
  @Column({ name: 'expira_em', type: 'datetime' }) expiraEm!: Date;
  @Column({ name: 'aceito_em', type: 'datetime', nullable: true })
  aceitoEm!: Date | null;
  @CreateDateColumn({ name: 'criado_em', type: 'datetime' }) criadoEm!: Date;
}
