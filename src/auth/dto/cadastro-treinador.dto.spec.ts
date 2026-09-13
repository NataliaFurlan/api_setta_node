import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CadastroTreinadorDto } from './cadastro-treinador.dto';

const base = {
  nome: 'Treinador Teste',
  senha: 'Senha123',
};

describe('CadastroTreinadorDto', () => {
  it.each([
    { ...base, email: 'treinador@exemplo.com' },
    { ...base, telefone: '(11) 99999-9999' },
    {
      ...base,
      email: 'treinador@exemplo.com',
      telefone: '(11) 99999-9999',
    },
  ])('aceita ao menos um contato válido', async (data) => {
    const errors = await validate(plainToInstance(CadastroTreinadorDto, data));
    expect(errors).toHaveLength(0);
  });

  it('rejeita cadastro sem e-mail e sem celular', async () => {
    const errors = await validate(plainToInstance(CadastroTreinadorDto, base));
    expect(errors.map(({ property }) => property)).toEqual(
      expect.arrayContaining(['email', 'telefone']),
    );
  });

  it('rejeita contatos inválidos mesmo quando ambos são informados', async () => {
    const errors = await validate(
      plainToInstance(CadastroTreinadorDto, {
        ...base,
        email: 'email-invalido',
        telefone: '123',
      }),
    );
    expect(errors.map(({ property }) => property)).toEqual(
      expect.arrayContaining(['email', 'telefone']),
    );
  });
});
