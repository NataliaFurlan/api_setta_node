import { ConfigService } from '@nestjs/config';
import { hash } from 'bcryptjs';
import { PasswordService } from './password.service';
describe('PasswordService', () => {
  const service = new PasswordService(
    new ConfigService({
      PASSWORD_PEPPER: 'pepper-de-teste-com-mais-de-32-bytes',
    }),
  );
  it('codifica e valida senha com pepper', async () => {
    const encoded = await service.encode('senha-segura');
    expect(encoded.startsWith(PasswordService.PREFIX)).toBe(true);
    await expect(service.matches('senha-segura', encoded)).resolves.toBe(true);
    await expect(service.matches('senha-errada', encoded)).resolves.toBe(false);
  });
  it('aceita bcrypt legado e solicita upgrade', async () => {
    const legacy = await hash('senha-antiga', 10);
    await expect(service.matches('senha-antiga', legacy)).resolves.toBe(true);
    expect(service.needsUpgrade(legacy)).toBe(true);
  });
});
