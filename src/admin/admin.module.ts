import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { LogAdministrativo } from '../database/entities/log-administrativo.entity';
import { Treinador } from '../database/entities/treinador.entity';
import { Usuario } from '../database/entities/usuario.entity';
import { AdminController } from './admin.controller';
import { AdminBootstrapService } from './admin-bootstrap.service';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Treinador, LogAdministrativo]),
    AuthModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminBootstrapService],
})
export class AdminModule {}
