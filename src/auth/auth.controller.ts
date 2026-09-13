import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { CadastroTreinadorDto } from './dto/cadastro-treinador.dto';
import { CadastroTreinadorResponseDto } from './dto/cadastro-treinador-response.dto';
@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('cadastro/treinador')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @ApiCreatedResponse({ type: CadastroTreinadorResponseDto })
  @ApiConflictResponse({ description: 'E-mail ou celular já cadastrado' })
  cadastrarTreinador(@Body() dto: CadastroTreinadorDto) {
    return this.auth.cadastrarTreinador(dto);
  }

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiUnauthorizedResponse({ description: 'Login ou senha inválidos' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }
}
