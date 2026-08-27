# AI Content Script Studio — Implementation Roadmap

> **Стек:** Next.js (App Router) · PostgreSQL · Prisma · BullMQ + Redis · Stripe · OpenAI API · Tailwind + shadcn/ui
>
> Статус обновляется после каждого завершённого действия.
> `- [ ]` = не начато · `- [x]` = сделано · `- [~]` = в процессе

---

## Phase 0: Foundation

- [x] 0.1 — Инициализация Next.js проекта (App Router, TypeScript, Tailwind, shadcn/ui)
- [x] 0.2 — Подключение PostgreSQL (Neon/Supabase) + Prisma ORM, базовая схема
- [x] 0.3 — Auth: NextAuth.js / Clerk (email + Google OAuth)
- [x] 0.4 — Database schema: users, creator_profiles, projects, scripts, script_blocks, packs, purchases, credits
- [x] 0.5 — BullMQ + Redis (Upstash): setup очередей, базовый worker
- [x] 0.6 — Stripe integration: checkout для 4 паков ($4.99 / $14.99 / $24.99 / $49.99), test mode

**Gate:** Деплой staging работает, auth проходит, Stripe test payment проходит, BullMQ worker отвечает.

---

## Phase 1: Core Engine — Creator Profile + Script Generation

- [x] 1.1 — Creator Profile: форма создания (ниша, аудитория, tone of voice, платформы, стиль)
- [x] 1.2 — LLM Pipeline — Idea Generator: тема → 10 идей/angles с учётом профиля
- [x] 1.3 — LLM Pipeline — Research Agent: для выбранной идеи — факты, инсайты, источники (web search / RAG)
- [x] 1.4 — LLM Pipeline — Script Builder: outline → full YouTube script + B-roll notes + titles + description + chapters
- [x] 1.5 — Script Editor: блочная структура, редактирование, перегенерация отдельных блоков (hook, outline, CTA)
- [x] 1.6 — Project History: список проектов с сохранёнными скриптами
- [x] 1.7 — BullMQ jobs: generate-ideas → generate-research → generate-script (sequential pipeline)
- [x] 1.8 — Real-time progress: статус генерации в UI (polling или SSE)

**Gate:** Пользователь создаёт Creator Profile, генерирует 10 идей, выбирает одну, получает полный YouTube-скрипт с возможностью перегенерации блоков.

---

## Phase 2: Multi-Platform Adaptation

- [x] 2.1 — TikTok/Reels/Shorts adapter: hook + short script (15–90 сек) + on-screen text + CTA + caption + B-roll
- [x] 2.2 — Instagram Carousel adapter: hook + структура слайдов (5–10) + тексты + CTA
- [x] 2.3 — LinkedIn adapter: hook + story/problem + insight + аргументы + CTA
- [x] 2.4 — X/Threads adapter: короткий пост или thread
- [x] 2.5 — Content Pack view: единая страница со всеми вариантами по платформам
- [x] 2.6 — BullMQ fan-out: параллельная генерация 5 платформ из одного research-блока
- [x] 2.7 — Export: копирование в буфер, экспорт в Markdown/TXT

**Gate:** Из одной темы — Content Pack с 5 платформами. Время генерации < 2 мин на полный пак.

---

## Phase 3: Credits & Monetization

- [x] 3.1 — Credits system: покупка паков начисляет кредиты (1 сценарий = 1 кредит), баланс в UI
- [x] 3.2 — Stripe Checkout: реальные платежи (production mode)
- [x] 3.3 — Usage tracking: логирование использования кредитов по платформам, история покупок
- [x] 3.4 — Paywall: бесплатный пользователь видит превью (первые 2–3 предложения), полный скрипт — за кредит
- [x] 3.5 — Landing page: маркетинговая страница с примерами, ценами, CTA

**Gate:** Первые реальные платежи. Target: >5% конверсия из регистрации в покупку.

---

## Phase 4: Quality & UX Polish

- [x] 4.1 — Feedback loop: thumb up/down на каждый блок, сбор оценок
- [x] 4.2 — Regeneration UX: перегенерация с параметрами (tone, length, angle)
- [x] 4.3 — Template library: предустановленные шаблоны по нишам (tech, fitness, business, education, entertainment)
- [x] 4.4 — Onboarding flow v2: guided tour, примеры, "создай первый скрипт за 2 минуты"
- [x] 4.5 — Performance: streaming responses, кеширование research, оптимизация промптов

**Gate:** NPS > 30, средняя оценка сценария > 3.5/5, repeat purchase rate > 20%.

---

## Phase 5: Growth & Retention

- [ ] 5.1 — Referral program: "поделись и получи 1 бесплатный сценарий"
- [ ] 5.2 — Email sequences: напоминания, "осталось N кредитов", новые фичи
- [ ] 5.3 — Community: публичная галерея примеров скриптов (anonymized)
- [ ] 5.4 — API access (Pro): REST API + документация для программного доступа
- [ ] 5.5 — Localization: интерфейс EN/RU, генерация на разных языках

---

## Phase 6: AI Pre-production Studio (post-validation)

- [x] 6.1 — Thumbnail concepts: генерация 3–5 thumbnail-концептов для YouTube (DALL-E/Flux)
- [x] 6.2 — Title + Thumbnail scoring: AI-оценка кликабельности
- [x] 6.3 — Visual assets: covers для Instagram, carousel visuals, инфографики
- [x] 6.4 — B-roll → stock search: интеграция с Pexels/Unsplash API

---

## Phase 7: CI/CD & DevOps

- [ ] 7.1 — GitHub Actions: lint + type-check + тесты на PR
- [ ] 7.2 — Automated DB migrations (Prisma migrate в CI)
- [ ] 7.3 — Preview deployments (Vercel PR previews)
- [ ] 7.4 — Production deploy pipeline (main → staging → production с manual gate)
- [ ] 7.5 — Monitoring: Sentry (errors) + Vercel Analytics (perf) + BullMQ Dashboard
- [ ] 7.6 — Backup strategy: automated Postgres backups, Redis persistence

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| LLM-сценарии не дотягивают до качества Fiverr-райтеров | Высокий | Feedback loop, prompt optimization, human review samples |
| Низкая willingness-to-pay | Высокий | Fiverr benchmark $5–30; наша цена ниже; $4.99 try-it |
| ChatGPT/Claude как substitute | Средний | Workflow + Creator Profile + multi-platform pack |
| Стоимость LLM API при масштабировании | Средний | Кеширование research, модели разного уровня, batch |

---

## Success Metrics (MVP Validation)

| Metric | Target | Timeframe |
|--------|--------|-----------|
| Registered users | 500 | 8 недель после ланча |
| Conversion to purchase | >5% | 8 недель |
| Repeat purchase rate | >20% | Месяц 2–3 |
| Avg script rating | >3.5/5 | Постоянно |
| Revenue | >$500 MRR | Месяц 3 |
| Time-to-first-script | <3 мин | Onboarding |
