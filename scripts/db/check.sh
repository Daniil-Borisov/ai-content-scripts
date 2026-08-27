#!/usr/bin/env bash
set -euo pipefail

# Проверка подключения к PostgreSQL по DATABASE_URL из .env
# Usage: ./scripts/db/check.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "FAIL: DATABASE_URL не задан (.env или окружение)" >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "FAIL: psql не установлен" >&2
  exit 1
fi

echo "Проверка DATABASE_URL..."
if ! psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "SELECT 1 AS ok;" >/dev/null; then
  echo "FAIL: нет подключения к БД" >&2
  exit 1
fi

TABLES="$(
  psql "$DATABASE_URL" -Atc \
    "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';"
)"

REQUIRED=(User Account Session Pack Credit Project Script)
MISSING=()
for table in "${REQUIRED[@]}"; do
  exists="$(
    psql "$DATABASE_URL" -Atc \
      "SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='${table}' LIMIT 1;"
  )"
  if [[ "$exists" != "1" ]]; then
    MISSING+=("$table")
  fi
done

echo "OK: подключение есть, таблиц в public: ${TABLES}"

if [[ "${#MISSING[@]}" -gt 0 ]]; then
  echo "WARN: нет таблиц: ${MISSING[*]}"
  echo "Запусти: AI_CONTENT_DB_PASSWORD='...' npm run db:schema"
  exit 2
fi

echo "OK: обязательные таблицы на месте"
