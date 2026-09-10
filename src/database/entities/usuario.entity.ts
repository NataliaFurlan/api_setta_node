import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
export enum TipoUsuario {
  TREINADOR = 'TREINADOR',
  ALUNO = 'ALUNO',
}
@Entity({ name: 'usuarios' })
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'id_usuario', type: 'bigint' })
  idUsuario!: string;
  @Column({ length: 150 }) nome!: string;
  @Column({ length: 180, unique: true }) email!: string;
  @Column({ name: 'senha_hash', select: false }) senhaHash!: string;
  @Column({ type: 'varchar', length: 30, nullable: true })
  telefone!: string | null;
  @Column({ name: 'tipo_usuario', type: 'enum', enum: TipoUsuario })
  tipoUsuario!: TipoUsuario;
  @Column({ type: 'boolean', default: true }) ativo!: boolean;
}
