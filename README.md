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
- `POST /api/auth/cadastro/treinador`
- `GET /api/docs` (Swagger)

O login recebe e-mail ou celular em `login`, além de `senha`, e retorna
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

Para avisar a equipe sobre novos cadastros de treinador, configure as variáveis
`SMTP_*` com a conta `equipe@varten.com.br`. Aplique também a migration
`migrations/004_trainer_contact.sql`, que permite cadastro com e-mail ou celular
e garante que celulares usados como login não se repitam.

## E-mails transacionais

O `MailModule` centraliza os envios SMTP e registra cada tentativa na tabela
`email_envios`. Ele atende atualmente:

- aviso interno de nova solicitação de treinador;
- convite para o aluno criar a senha e ativar a conta.

Antes de publicar esta versão, execute `migrations/005_email_deliveries.sql` nos
bancos de teste e produção. Depois, configure no ambiente da API:

```env
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=equipe@varten.com.br
SMTP_PASSWORD=senha-da-caixa-na-hostinger
SMTP_FROM=Setta <equipe@varten.com.br>
REGISTRATION_NOTIFICATION_EMAIL=equipe@varten.com.br
PORTAL_URL=https://admin-setta.varten.com.br
```

`SMTP_PASSWORD` é a senha da caixa de e-mail, não a senha da conta Hostinger.
Nunca versione esse valor. Se o SMTP falhar, o convite permanece criado e a
resposta devolve `emailStatus: FALHA` junto do link, permitindo o envio manual.

Para auditar os últimos envios:

```sql
SELECT id_email, tipo, destinatario, status, tentativas, ultimo_erro, criado_em,
       enviado_em
FROM email_envios
ORDER BY id_email DESC
LIMIT 50;
```
