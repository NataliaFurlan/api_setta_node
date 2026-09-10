import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/jwt.strategy';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { TipoUsuario } from '../database/entities/usuario.entity';
import { TrainerService } from './trainer.service';
import { AcceptStudentInviteDto } from './dto/accept-student-invite.dto';
import { CreateStudentInviteDto } from './dto/create-student-invite.dto';

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
  @Get('alunos/:id') student(
    @Req() request: { user: JwtPayload },
    @Param('id') id: string,
  ) {
    return this.trainer.student(request.user.idUsuario, id);
  }
  @Post('convites') invite(
    @Req() request: { user: JwtPayload },
    @Body() dto: CreateStudentInviteDto,
  ) {
    return this.trainer.createInvite(request.user.idUsuario, dto);
  }
}

@ApiTags('Convite de aluno')
@Controller('convites/alunos')
export class StudentInviteController {
  constructor(private readonly trainer: TrainerService) {}
  @Get(':token') get(@Param('token') token: string) {
    return this.trainer.getInvite(token);
  }
  @Post(':token/aceitar') accept(
    @Param('token') token: string,
    @Body() dto: AcceptStudentInviteDto,
  ) {
    return this.trainer.acceptInvite(token, dto);
  }
}
