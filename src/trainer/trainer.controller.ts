import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/jwt.strategy';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { TipoUsuario } from '../database/entities/usuario.entity';
import { TrainerService } from './trainer.service';

@ApiTags('Treinador')
@ApiBearerAuth()
@Controller('treinador')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(TipoUsuario.TREINADOR)
export class TrainerController {
  constructor(private readonly trainer: TrainerService) {}
  @Get('dashboard') dashboard(@Req() request: { user: JwtPayload }) {
    return this.trainer.dashboard(request.user.idUsuario);
  }
  @Get('alunos') students(@Req() request: { user: JwtPayload }) {
    return this.trainer.studentsList(request.user.idUsuario);
  }
}
