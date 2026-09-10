ALTER TABLE alunos
  ADD COLUMN IF NOT EXISTS id_treinador BIGINT NULL,
  ADD INDEX IF NOT EXISTS idx_alunos_treinador (id_treinador);
