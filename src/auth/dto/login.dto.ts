import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';
export class LoginDto {
  @ApiProperty({ example: 'henrique@setta.dev ou (11) 99999-9999' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @MinLength(3)
  login!: string;
  @ApiProperty({ example: 'senha123' })
  @IsString()
  @MinLength(1)
  senha!: string;
}
