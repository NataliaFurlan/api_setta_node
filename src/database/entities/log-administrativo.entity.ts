import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum AcaoAdministrativa {
  APROVAR_TREINADOR = 'APROVAR_TREINADOR',
  REPROVAR_TREINADOR = 'REPROVAR_TREINADOR',
  SUSPENDER_TREINADOR = 'SUSPENDER_TREINADOR',
  REATIVAR_TREINADOR = 'REATIVAR_TREINADOR',
}

@Entity({ name: 'logs_administrativos' })
export class LogAdministrativo {
  @PrimaryGeneratedColumn({ name: 'id_log', type: 'bigint' }) idLog!: string;
  @Column({ name: 'id_admin', type: 'bigint' }) idAdmin!: string;
  @Column({ name: 'id_usuario_alvo', type: 'bigint' }) idUsuarioAlvo!: string;
  @Column({ type: 'enum', enum: AcaoAdministrativa }) acao!: AcaoAdministrativa;
  @Column({ type: 'text' }) justificativa!: string;
  @Column({ name: 'estado_anterior', type: 'json', nullable: true })
  estadoAnterior!: Record<string, unknown> | null;
  @Column({ name: 'estado_novo', type: 'json', nullable: true })
  estadoNovo!: Record<string, unknown> | null;
  @CreateDateColumn({ name: 'criado_em', type: 'datetime' }) criadoEm!: Date;
}
