import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Aluno } from '../database/entities/aluno.entity';
import { ConviteAluno } from '../database/entities/convite-aluno.entity';
import { Treinador } from '../database/entities/treinador.entity';
import { Usuario } from '../database/entities/usuario.entity';
import {
  StudentInviteController,
  TrainerController,
} from './trainer.controller';
import { TrainerService } from './trainer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Treinador, Aluno, Usuario, ConviteAluno]),
    AuthModule,
  ],
  controllers: [TrainerController, StudentInviteController],
  providers: [TrainerService],
})
export class TrainerModule {}
