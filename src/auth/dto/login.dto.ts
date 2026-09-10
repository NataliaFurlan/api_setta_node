import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';
export class LoginDto {
  @ApiProperty({ example: 'henrique@setta.dev' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  login!: string;
  @ApiProperty({ example: 'senha123' })
  @IsString()
  @MinLength(1)
  senha!: string;
}
