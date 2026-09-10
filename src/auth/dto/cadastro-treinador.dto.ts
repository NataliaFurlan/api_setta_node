import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CadastroTreinadorDto {
  @ApiProperty({ example: 'Henrique Aiello' })
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  nome!: string;

  @ApiProperty({ example: 'henrique@exemplo.com' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(180)
  email!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'A senha deve conter letra maiúscula, minúscula e número',
  })
  senha!: string;

  @ApiPropertyOptional({ example: '(11) 99999-9999' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefone?: string;

  @ApiPropertyOptional({ example: 'Henrique Performance' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nomeProfissional?: string;

  @ApiPropertyOptional({ example: '123456-G/SP' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  cref?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;
}
