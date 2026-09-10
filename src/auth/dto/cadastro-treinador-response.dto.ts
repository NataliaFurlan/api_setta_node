import { ApiProperty } from '@nestjs/swagger';

export class CadastroTreinadorResponseDto {
  @ApiProperty({ example: 'PENDENTE_APROVACAO' })
  status!: 'PENDENTE_APROVACAO';

  @ApiProperty({ example: 'Cadastro enviado para análise.' })
  mensagem!: string;
}
