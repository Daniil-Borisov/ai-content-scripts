#!/usr/bin/env bash
set -euo pipefail

# Инициализация PostgreSQL для AI Content Studio.
# Использование:
#   AI_CONTENT_DB_PASSWORD='пароль' ./scripts/db/setup.sh
#   AI_CONTENT_DB_PASSWORD='пароль' ./scripts/db/setup.sh --schema-only
#   AI_CONTENT_DB_PASSWORD='пароль' ./scripts/db/setup.sh --seed-only

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DB_NAME="${AI_CONTENT_DB_NAME:-ai_content}"
DB_USER="${AI_CONTENT_DB_USER:-ai_content}"
DB_HOST="${AI_CONTENT_DB_HOST:-localhost}"
DB_PORT="${AI_CONTENT_DB_PORT:-5432}"
PG_SUPERUSER="${PG_SUPERUSER:-postgres}"
MODE="${1:-all}"

log() {
  echo "[db-setup $(date '+%Y-%m-%d %H:%M:%S')] $*"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Ошибка: команда '$1' не найдена" >&2
    exit 1
  fi
}

require_cmd psql

if [[ -z "${AI_CONTENT_DB_PASSWORD:-}" ]]; then
  echo "Ошибка: задайте AI_CONTENT_DB_PASSWORD" >&2
  echo "Пример: AI_CONTENT_DB_PASSWORD='secret' $0" >&2
  exit 1
fi

run_as_superuser() {
  if [[ "$(id -un)" == "postgres" ]]; then
    psql -v ON_ERROR_STOP=1 "$@"
  elif command -v sudo >/dev/null 2>&1 && sudo -n -u "$PG_SUPERUSER" true 2>/dev/null; then
    sudo -u "$PG_SUPERUSER" psql -v ON_ERROR_STOP=1 "$@"
  else
    PGPASSWORD="${PG_SUPERUSER_PASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$PG_SUPERUSER" -v ON_ERROR_STOP=1 "$@"
  fi
}

run_as_app() {
  PGPASSWORD="$AI_CONTENT_DB_PASSWORD" \
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 "$@"
}

create_role_and_db() {
  log "Создание роли и БД ($DB_USER / $DB_NAME)..."
  run_as_superuser -d postgres <<SQL
SELECT set_config('ai_content.password', '${AI_CONTENT_DB_PASSWORD//\'/\'\'}', false);

DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', '${DB_USER}', current_setting('ai_content.password'));
  ELSE
    EXECUTE format('ALTER ROLE %I WITH LOGIN PASSWORD %L', '${DB_USER}', current_setting('ai_content.password'));
  END IF;
END
\$\$;

SELECT format('CREATE DATABASE %I OWNER %I', '${DB_NAME}', '${DB_USER}')
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec

GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
SQL

  run_as_superuser -d "$DB_NAME" <<SQL
GRANT ALL ON SCHEMA public TO ${DB_USER};
ALTER SCHEMA public OWNER TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${DB_USER};
SQL
}

apply_schema() {
  log "Применение схемы..."
  run_as_app -f "$ROOT_DIR/scripts/db/02_schema.sql"
}

apply_seed() {
  log "Сиды (packs)..."
  run_as_app -f "$ROOT_DIR/scripts/db/03_seed.sql"
}

case "$MODE" in
  all|--all|"")
    create_role_and_db
    apply_schema
    apply_seed
    ;;
  --schema-only)
    apply_schema
    ;;
  --seed-only)
    apply_seed
    ;;
  --create-only)
    create_role_and_db
    ;;
  *)
    echo "Использование: $0 [--all|--create-only|--schema-only|--seed-only]" >&2
    exit 1
    ;;
esac

ENCODED_PASSWORD="$(
  node -e "process.stdout.write(encodeURIComponent(process.argv[1]))" "$AI_CONTENT_DB_PASSWORD"
)"

log "Готово."
echo
echo "DATABASE_URL=postgresql://${DB_USER}:${ENCODED_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
echo
echo "Проверка:"
echo "  PGPASSWORD='***' psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -c '\\dt'"
