import { IsString, Matches, MinLength } from 'class-validator';
export class AcceptStudentInviteDto {
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'A senha deve conter letra maiúscula, minúscula e número',
  })
  senha!: string;
}
