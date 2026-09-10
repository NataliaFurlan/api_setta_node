import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Aluno } from '../database/entities/aluno.entity';
import { Treinador } from '../database/entities/treinador.entity';
import { TrainerController } from './trainer.controller';
import { TrainerService } from './trainer.service';

@Module({
  imports: [TypeOrmModule.forFeature([Treinador, Aluno]), AuthModule],
  controllers: [TrainerController],
  providers: [TrainerService],
})
export class TrainerModule {}
