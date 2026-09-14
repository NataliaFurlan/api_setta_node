import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum StatusEmailEnvio {
  PENDENTE = 'PENDENTE',
  ENVIADO = 'ENVIADO',
  FALHA = 'FALHA',
}

@Entity({ name: 'email_envios' })
export class EmailEnvio {
  @PrimaryGeneratedColumn({ name: 'id_email', type: 'bigint' })
  idEmail!: string;

  @Column({ length: 60 }) tipo!: string;
  @Column({ length: 180 }) destinatario!: string;
  @Column({ length: 240 }) assunto!: string;
  @Column({
    type: 'enum',
    enum: StatusEmailEnvio,
    default: StatusEmailEnvio.PENDENTE,
  })
  status!: StatusEmailEnvio;
  @Column({ default: 0 }) tentativas!: number;
  @Column({ name: 'ultimo_erro', type: 'text', nullable: true }) ultimoErro!:
    string | null;
  @Column({ name: 'id_provedor', length: 255, nullable: true }) idProvedor!:
    string | null;
  @CreateDateColumn({ name: 'criado_em' }) criadoEm!: Date;
  @Column({ name: 'enviado_em', type: 'datetime', nullable: true })
  enviadoEm!: Date | null;
}
