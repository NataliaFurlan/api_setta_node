CREATE TABLE IF NOT EXISTS email_envios (
  id_email BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  tipo VARCHAR(60) NOT NULL,
  destinatario VARCHAR(180) NOT NULL,
  assunto VARCHAR(240) NOT NULL,
  status ENUM('PENDENTE', 'ENVIADO', 'FALHA') NOT NULL DEFAULT 'PENDENTE',
  tentativas INT NOT NULL DEFAULT 0,
  ultimo_erro TEXT NULL,
  id_provedor VARCHAR(255) NULL,
  criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  enviado_em DATETIME NULL,
  PRIMARY KEY (id_email),
  INDEX idx_email_envios_status_criado (status, criado_em),
  INDEX idx_email_envios_destinatario (destinatario)
);
