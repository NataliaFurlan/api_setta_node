import { isAllowedCorsOrigin } from './cors';

describe('isAllowedCorsOrigin', () => {
  const configured = new Set(['https://admin-test-setta.varten.com.br']);

  it('permite requisicoes sem Origin e dominios configurados', () => {
    expect(isAllowedCorsOrigin(undefined, configured)).toBe(true);
    expect(
      isAllowedCorsOrigin('https://admin-test-setta.varten.com.br', configured),
    ).toBe(true);
  });

  it('permite loopback em qualquer porta para o Flutter local', () => {
    expect(isAllowedCorsOrigin('http://localhost:55165', configured)).toBe(
      true,
    );
    expect(isAllowedCorsOrigin('http://127.0.0.1:8080', configured)).toBe(true);
  });

  it('rejeita origens externas nao configuradas', () => {
    expect(isAllowedCorsOrigin('https://example.com', configured)).toBe(false);
    expect(
      isAllowedCorsOrigin('https://localhost.example.com', configured),
    ).toBe(false);
  });
});
