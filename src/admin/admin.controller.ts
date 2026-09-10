import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/jwt.strategy';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { StatusTreinador } from '../database/entities/treinador.entity';
import { TipoUsuario } from '../database/entities/usuario.entity';
import { AdminService } from './admin.service';
import { AlterarSuspensaoDto } from './dto/alterar-suspensao.dto';
import { RevisarTreinadorDto } from './dto/revisar-treinador.dto';

@ApiTags('Administração')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(TipoUsuario.ADMIN)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('dashboard') dashboard() {
    return this.admin.dashboard();
  }
  @Get('treinadores') listar(
    @Query('status', new ParseEnumPipe(StatusTreinador, { optional: true }))
    status?: StatusTreinador,
  ) {
    return this.admin.listarTreinadores(status);
  }
  @Get('treinadores/:id') obter(@Param('id') id: string) {
    return this.admin.obterTreinador(id);
  }
  @Patch('treinadores/:id/revisao') revisar(
    @Param('id') id: string,
    @Body() dto: RevisarTreinadorDto,
    @Req() request: { user: JwtPayload },
  ) {
    return this.admin.revisar(id, dto, request.user.idUsuario);
  }
  @Patch('treinadores/:id/suspensao') suspender(
    @Param('id') id: string,
    @Body() dto: AlterarSuspensaoDto,
    @Req() request: { user: JwtPayload },
  ) {
    return this.admin.alterarSuspensao(id, dto, request.user.idUsuario);
  }
  @Get('logs') logs() {
    return this.admin.listarLogs();
  }
  @Get('sistema') sistema() {
    return {
      api: 'setta',
      version: process.env.npm_package_version ?? '0.0.1',
      environment: process.env.NODE_ENV ?? 'development',
    };
  }
}
