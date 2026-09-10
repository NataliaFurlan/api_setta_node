import { ApiProperty } from '@nestjs/swagger';
import { TipoUsuario } from '../../database/entities/usuario.entity';
export class LoginResponseDto {
  @ApiProperty() token!: string;
  @ApiProperty({ enum: TipoUsuario }) tipo!: TipoUsuario;
  @ApiProperty() idUsuario!: string;
  @ApiProperty() idPerfil!: string;
  @ApiProperty() nome!: string;
}
