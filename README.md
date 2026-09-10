# Setta API — NestJS

API do MVP Setta preparada para o Web App Node.js da Hostinger.

## Stack

- Node.js 22+, NestJS 11 e TypeScript
- TypeORM + MySQL
- JWT Bearer
- HMAC-SHA-256 com pepper + BCrypt (custo 12)
- Swagger, Helmet, validação de DTOs e rate limit

## Desenvolvimento

```bash
cp .env.example .env
npm install
npm run start:dev
```

Todas as variáveis listadas em `.env.example` são validadas no início. A API não
inicia com segredos ausentes ou menores que 32 bytes. Nunca versione o `.env`.

## Endpoints iniciais

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/docs` (Swagger)

O login mantém o contrato da API Java: recebe `login` e `senha`, e retorna
`token`, `tipo`, `idUsuario`, `idPerfil` e `nome`.

Hashes `{bcrypt-pepper-v1}` são compatíveis com a versão Java. Hashes BCrypt
legados continuam válidos e são migrados no primeiro login.

## Hostinger

- Framework: NestJS ou Other
- Build: `npm run build`
- Start: `npm run start:prod`
- Output: `dist`
- Node: 22.x

Cadastre as variáveis de `.env.example` no hPanel. `synchronize` permanece
desligado para proteger o esquema existente.
