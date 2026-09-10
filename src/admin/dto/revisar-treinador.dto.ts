import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';

export enum DecisaoCadastro {
  APROVAR = 'APROVAR',
  REPROVAR = 'REPROVAR',
}

export class RevisarTreinadorDto {
  @ApiProperty({ enum: DecisaoCadastro })
  @IsEnum(DecisaoCadastro)
  decisao!: DecisaoCadastro;

  @ApiProperty({ minLength: 5, maxLength: 1000 })
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  justificativa!: string;
}
