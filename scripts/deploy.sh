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

# Сначала обновляем код, затем перезапускаем УЖЕ новый скрипт.
# Иначе bash продолжает выполнять старую версию из памяти/inode.
if [[ "${1:-}" != "--post-pull" ]]; then
  require_cmd git

  log "Каталог: $ROOT_DIR"
  log "Ветка: $BRANCH"
  log "Получение изменений..."
  git fetch origin "$BRANCH"
  git checkout "$BRANCH"
  git reset --hard "origin/$BRANCH"

  exec bash "$ROOT_DIR/scripts/deploy.sh" --post-pull
fi

require_cmd node
require_cmd npm
require_cmd npx
require_cmd pm2

if [[ ! -f .env ]]; then
  echo "Ошибка: файл .env отсутствует в $ROOT_DIR" >&2
  echo "Скопируйте .env.example в .env и заполните production-значения." >&2
  exit 1
fi

log "Установка зависимостей..."
# Не удаляем node_modules каждый раз — экономим RAM/диск на маленьком VPS
npm install --no-audit --no-fund

log "Prisma generate..."
npx prisma generate

if [[ "${RUN_PRISMA_MIGRATE:-0}" == "1" ]]; then
  log "Prisma migrate deploy..."
  npx prisma migrate deploy
fi

# exit 137 = OOM killer. Turbopack на слабом VPS часто убивается.
mem_kb="$(awk '/MemAvailable:/ {print $2}' /proc/meminfo || echo 0)"
swap_kb="$(awk '/SwapTotal:/ {print $2}' /proc/meminfo || echo 0)"
log "Память: available=${mem_kb}kB swap=${swap_kb}kB"
if [[ "${swap_kb}" -lt 1048576 ]]; then
  echo "Ошибка: для next build нужно >=1GB swap (сейчас ${swap_kb}kB)." >&2
  echo "На сервере выполните:" >&2
  echo "  sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile" >&2
  echo "  sudo mkswap /swapfile && sudo swapon /swapfile" >&2
  echo "  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab" >&2
  exit 1
fi

log "Запись build-info..."
GIT_SHA="$(git rev-parse --short HEAD)"
GIT_SHA_FULL="$(git rev-parse HEAD)"
BUILT_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
mkdir -p public
cat > public/build-info.json <<EOF
{
  "gitSha": "${GIT_SHA}",
  "gitShaFull": "${GIT_SHA_FULL}",
  "builtAt": "${BUILT_AT}",
  "branch": "${BRANCH}"
}
EOF
export NEXT_PUBLIC_GIT_SHA="${GIT_SHA}"
export NEXT_PUBLIC_BUILT_AT="${BUILT_AT}"
export GIT_SHA_FULL="${GIT_SHA_FULL}"
log "Build marker: ${GIT_SHA} @ ${BUILT_AT}"

log "Сборка Next.js (webpack, меньше пик RAM чем turbopack)..."
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1536}"
npx next build --webpack

mkdir -p logs

log "Перезапуск PM2..."
if pm2 describe ai-content-web >/dev/null 2>&1; then
  pm2 restart ecosystem.config.cjs --update-env
else
  pm2 start ecosystem.config.cjs
fi

pm2 save

log "Статус:"
pm2 status

log "Проверка версии на :3000..."
sleep 2
if command -v curl >/dev/null 2>&1; then
  HEALTH_JSON="$(curl -fsS --max-time 10 http://127.0.0.1:3000/api/health || true)"
  if [[ -n "$HEALTH_JSON" ]]; then
    echo "$HEALTH_JSON"
    RUNNING_SHA="$(node -e "const d=JSON.parse(process.argv[1]); process.stdout.write(d?.build?.gitSha||'')" "$HEALTH_JSON")"
    if [[ "$RUNNING_SHA" != "$GIT_SHA" ]]; then
      echo "WARN: ожидался gitSha=${GIT_SHA}, в /api/health=${RUNNING_SHA:-empty}" >&2
      echo "Проверь: pm2 logs ai-content-web --lines 50" >&2
      exit 1
    fi
    log "OK: сервер отдаёт сборку ${RUNNING_SHA}"
  else
    echo "WARN: /api/health недоступен сразу после рестарта" >&2
    echo "Проверь вручную: curl -s http://127.0.0.1:3000/api/version" >&2
  fi
fi

log "Деплой завершён. version=${GIT_SHA} builtAt=${BUILT_AT}"
