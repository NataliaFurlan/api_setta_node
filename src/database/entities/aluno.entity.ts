import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity({ name: 'alunos' })
export class Aluno {
  @PrimaryGeneratedColumn({ name: 'id_aluno', type: 'bigint' })
  idAluno!: string;
  @Column({ name: 'id_usuario', type: 'bigint' }) idUsuario!: string;
}
