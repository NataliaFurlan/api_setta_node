import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateStudentInviteDto {
  @IsString() @MinLength(3) @MaxLength(150) nome!: string;
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(180)
  email!: string;
  @IsOptional() @IsString() @MaxLength(30) telefone?: string;
}
