import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aluno } from '../database/entities/aluno.entity';
import { Treinador } from '../database/entities/treinador.entity';
import { Usuario } from '../database/entities/usuario.entity';

@Injectable()
export class TrainerService {
  constructor(
    @InjectRepository(Treinador)
    private readonly trainers: Repository<Treinador>,
    @InjectRepository(Aluno) private readonly students: Repository<Aluno>,
  ) {}
  async dashboard(idUsuario: string) {
    const trainer = await this.trainers.findOneByOrFail({ idUsuario });
    const totalAlunos = await this.students.countBy({
      idTreinador: trainer.idTreinador,
    });
    return {
      totalAlunos,
      treinosAtivos: 0,
      solicitacoesPendentes: 0,
      fichasParaRevisar: 0,
    };
  }
  async studentsList(idUsuario: string) {
    const trainer = await this.trainers.findOneByOrFail({ idUsuario });
    return this.students
      .createQueryBuilder('aluno')
      .innerJoin(Usuario, 'usuario', 'usuario.idUsuario = aluno.idUsuario')
      .select([
        'aluno.idAluno AS idAluno',
        'usuario.nome AS nome',
        'usuario.email AS email',
        'usuario.telefone AS telefone',
        'usuario.ativo AS ativo',
      ])
      .where('aluno.idTreinador = :idTreinador', {
        idTreinador: trainer.idTreinador,
      })
      .orderBy('usuario.nome', 'ASC')
      .getRawMany<{
        idAluno: string;
        nome: string;
        email: string;
        telefone: string | null;
        ativo: boolean;
      }>();
  }
}
