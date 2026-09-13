import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
export enum TipoUsuario {
  ADMIN = 'ADMIN',
  TREINADOR = 'TREINADOR',
  ALUNO = 'ALUNO',
}
@Entity({ name: 'usuarios' })
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'id_usuario', type: 'bigint' })
  idUsuario!: string;
  @Column({ length: 150 }) nome!: string;
  @Column({ type: 'varchar', length: 180, unique: true, nullable: true })
  email!: string | null;
  @Column({ name: 'senha_hash', select: false }) senhaHash!: string;
  @Column({ type: 'varchar', length: 30, nullable: true })
  telefone!: string | null;
  @Column({ name: 'tipo_usuario', type: 'enum', enum: TipoUsuario })
  tipoUsuario!: TipoUsuario;
  @Column({ type: 'boolean', default: true }) ativo!: boolean;
  @Column({ name: 'versao_sessao', type: 'int', default: 0 })
  versaoSessao!: number;
  @CreateDateColumn({ name: 'criado_em', type: 'datetime' }) criadoEm!: Date;
  @UpdateDateColumn({ name: 'atualizado_em', type: 'datetime' })
  atualizadoEm!: Date;
}
