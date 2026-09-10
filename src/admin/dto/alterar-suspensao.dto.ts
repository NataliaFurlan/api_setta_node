import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';

export enum AcaoSuspensao {
  SUSPENDER = 'SUSPENDER',
  REATIVAR = 'REATIVAR',
}

export class AlterarSuspensaoDto {
  @ApiProperty({ enum: AcaoSuspensao })
  @IsEnum(AcaoSuspensao)
  acao!: AcaoSuspensao;

  @ApiProperty({ minLength: 5, maxLength: 1000 })
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  justificativa!: string;
}
