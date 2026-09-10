const required = [
  'DB_HOST',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_DATABASE',
  'JWT_SECRET',
  'PASSWORD_PEPPER',
  'CORS_ORIGINS',
];
export function validateEnvironment(config: Record<string, unknown>) {
  for (const key of required) {
    if (typeof config[key] !== 'string' || config[key].trim() === '')
      throw new Error(`Variável de ambiente obrigatória ausente: ${key}`);
  }
  for (const key of ['JWT_SECRET', 'PASSWORD_PEPPER']) {
    if (Buffer.byteLength(config[key] as string, 'utf8') < 32)
      throw new Error(`${key} deve possuir pelo menos 32 bytes`);
  }
  return config;
}
