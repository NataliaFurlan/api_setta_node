import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity({ name: 'treinadores' })
export class Treinador {
  @PrimaryGeneratedColumn({ name: 'id_treinador', type: 'bigint' })
  idTreinador!: string;
  @Column({ name: 'id_usuario', type: 'bigint' }) idUsuario!: string;
}
