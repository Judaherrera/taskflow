-- Script de inicialización de PostgreSQL.
-- La imagen oficial de postgres ejecuta automáticamente los .sql de
-- /docker-entrypoint-initdb.d la PRIMERA vez que se crea el volumen.
CREATE TABLE IF NOT EXISTS tasks (
  id         SERIAL PRIMARY KEY,
  title      VARCHAR(200) NOT NULL,
  done       BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

INSERT INTO tasks (title, done) VALUES
  ('Configurar Docker Compose', TRUE),
  ('Implementar GitHub Actions', FALSE),
  ('Documentar en README y Wiki', FALSE);
