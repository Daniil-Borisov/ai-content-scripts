-- Создание роли и БД. Запускать через scripts/db/setup.sh
-- или вручную от postgres (подставьте пароль):
--
--   sudo -u postgres psql <<'SQL'
--   DO $$
--   BEGIN
--     IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'ai_content') THEN
--       CREATE ROLE ai_content LOGIN PASSWORD 'CHANGE_ME';
--     ELSE
--       ALTER ROLE ai_content WITH LOGIN PASSWORD 'CHANGE_ME';
--     END IF;
--   END $$;
--   SELECT 'CREATE DATABASE ai_content OWNER ai_content'
--   WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ai_content')\gexec
--   GRANT ALL PRIVILEGES ON DATABASE ai_content TO ai_content;
--   SQL

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'ai_content') THEN
    EXECUTE format('CREATE ROLE ai_content LOGIN PASSWORD %L', current_setting('ai_content.password'));
  ELSE
    EXECUTE format('ALTER ROLE ai_content WITH LOGIN PASSWORD %L', current_setting('ai_content.password'));
  END IF;
END
$$;

SELECT 'CREATE DATABASE ai_content OWNER ai_content'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ai_content')\gexec

GRANT ALL PRIVILEGES ON DATABASE ai_content TO ai_content;
