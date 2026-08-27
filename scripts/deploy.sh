#!/usr/bin/env bash
set -euo pipefail

# Деплой на сервере: обновление кода, сборка, рестарт PM2 (web + worker).
# Запускается локально на сервере или через GitHub Actions по SSH.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BRANCH="${DEPLOY_BRANCH:-main}"
NODE_ENV=production

log() {
  echo "[deploy $(date '+%Y-%m-%d %H:%M:%S')] $*"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Ошибка: команда '$1' не найдена" >&2
    exit 1
  fi
}

require_cmd git
require_cmd node
require_cmd npm
require_cmd npx
require_cmd pm2

if [[ ! -f .env ]]; then
  echo "Ошибка: файл .env отсутствует в $ROOT_DIR" >&2
  echo "Скопируйте .env.example в .env и заполните production-значения." >&2
  exit 1
fi

log "Каталог: $ROOT_DIR"
log "Ветка: $BRANCH"

log "Получение изменений..."
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

log "Установка зависимостей..."
# npm ci падает на сервере (npm 10), если lockfile собран на npm 11 / другой платформе
rm -rf node_modules
npm install --no-audit --no-fund

log "Prisma generate..."
npx prisma generate

if [[ "${RUN_PRISMA_MIGRATE:-0}" == "1" ]]; then
  log "Prisma migrate deploy..."
  npx prisma migrate deploy
fi

log "Сборка Next.js..."
npm run build

mkdir -p logs

log "Перезапуск PM2..."
if pm2 describe ai-content-web >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --update-env
else
  pm2 start ecosystem.config.cjs
fi

pm2 save

log "Статус:"
pm2 status

log "Деплой завершён."
