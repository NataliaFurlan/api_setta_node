CREATE TABLE IF NOT EXISTS convites_alunos (
  id_convite BIGINT NOT NULL AUTO_INCREMENT,
  id_treinador BIGINT NOT NULL,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(180) NOT NULL,
  telefone VARCHAR(30) NULL,
  token_hash VARCHAR(64) NOT NULL,
  status ENUM('PENDENTE', 'ACEITO', 'REVOGADO') NOT NULL DEFAULT 'PENDENTE',
  expira_em DATETIME NOT NULL,
  aceito_em DATETIME NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_convite),
  UNIQUE KEY uk_convites_token_hash (token_hash),
  INDEX idx_convites_treinador_status (id_treinador, status),
  INDEX idx_convites_email (email)
);
