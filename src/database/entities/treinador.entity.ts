import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum StatusTreinador {
  PENDENTE = 'PENDENTE',
  APROVADO = 'APROVADO',
  REPROVADO = 'REPROVADO',
  SUSPENSO = 'SUSPENSO',
}
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
  @Column({
    type: 'enum',
    enum: StatusTreinador,
    default: StatusTreinador.PENDENTE,
  })
  status!: StatusTreinador;
  @Column({ name: 'justificativa_analise', type: 'text', nullable: true })
  justificativaAnalise!: string | null;
  @Column({ name: 'analisado_em', type: 'datetime', nullable: true })
  analisadoEm!: Date | null;
  @Column({ name: 'analisado_por', type: 'bigint', nullable: true })
  analisadoPor!: string | null;
  @CreateDateColumn({ name: 'criado_em', type: 'datetime' }) criadoEm!: Date;
  @UpdateDateColumn({ name: 'atualizado_em', type: 'datetime' })
  atualizadoEm!: Date;
}
