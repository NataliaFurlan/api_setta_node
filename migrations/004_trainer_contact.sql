ALTER TABLE usuarios
  MODIFY COLUMN email VARCHAR(180) NULL;

UPDATE usuarios
SET telefone = NULLIF(REGEXP_REPLACE(telefone, '[^0-9]', ''), '')
WHERE telefone IS NOT NULL;

ALTER TABLE usuarios
  ADD UNIQUE INDEX uq_usuarios_telefone (telefone);
