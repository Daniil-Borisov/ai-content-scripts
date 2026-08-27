"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Check,
  Circle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Zap,
  Database,
  Shield,
  Layers,
  Cpu,
  Globe,
  CreditCard,
  Star,
  TrendingUp,
  Rocket,
  Settings,
  FileText,
  Search,
  Edit3,
  Clock,
  RefreshCw,
  Activity,
  Users,
  Mail,
  Image,
  Code,
  Monitor,
  GitBranch,
  Server,
  ShieldCheck,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  done: boolean;
  description?: string;
  files?: string[];
}

interface Phase {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  tasks: Task[];
  gate?: string;
}

const phases: Phase[] = [
  {
    id: "phase-0",
    title: "Foundation",
    icon: Database,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    gate: "Деплой staging работает, auth проходит, Stripe test payment проходит, BullMQ worker отвечает.",
    tasks: [
      { id: "0.1", title: "Инициализация Next.js проекта", done: true, description: "App Router, TypeScript, Tailwind, shadcn/ui", files: ["package.json", "src/app/layout.tsx", "src/app/globals.css"] },
      { id: "0.2", title: "PostgreSQL + Prisma ORM", done: true, description: "Подключение базы данных, базовая схема", files: ["prisma/schema.prisma", "src/lib/db.ts"] },
      { id: "0.3", title: "Auth: NextAuth.js", done: true, description: "Email + Google OAuth", files: ["src/lib/auth.ts", "src/app/api/auth/[...nextauth]/route.ts"] },
      { id: "0.4", title: "Database schema", done: true, description: "users, creator_profiles, projects, scripts, script_blocks, packs, purchases, credits", files: ["prisma/schema.prisma"] },
      { id: "0.5", title: "BullMQ + Redis", done: true, description: "Setup очередей, базовый worker", files: ["src/lib/queue.ts", "src/workers/script-worker.ts"] },
      { id: "0.6", title: "Stripe integration", done: true, description: "Checkout для 4 паков ($4.99 / $14.99 / $24.99 / $49.99)", files: ["src/lib/stripe.ts", "src/app/api/checkout/route.ts", "src/app/api/webhook/stripe/route.ts"] },
    ],
  },
  {
    id: "phase-1",
    title: "Core Engine",
    icon: Cpu,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    gate: "Пользователь создаёт Creator Profile, генерирует 10 идей, выбирает одну, получает полный YouTube-скрипт с возможностью перегенерации блоков.",
    tasks: [
      { id: "1.1", title: "Creator Profile", done: true, description: "Форма создания: ниша, аудитория, tone of voice, платформы, стиль", files: ["src/app/dashboard/profile/page.tsx"] },
      { id: "1.2", title: "Idea Generator", done: true, description: "Тема → 10 идей/angles с учётом профиля", files: ["src/app/dashboard/new/page.tsx", "src/app/api/generate/ideas/route.ts"] },
      { id: "1.3", title: "Research Agent", done: true, description: "Факты, инсайты, источники (web search / RAG)", files: ["src/lib/llm.ts", "src/app/api/generate/research/route.ts"] },
      { id: "1.4", title: "Script Builder", done: true, description: "Outline → full YouTube script + B-roll notes + titles + description + chapters", files: ["src/app/api/generate/script/route.ts"] },
      { id: "1.5", title: "Script Editor", done: true, description: "Блочная структура, редактирование, перегенерация отдельных блоков", files: ["src/app/dashboard/project/generate/page.tsx"] },
      { id: "1.6", title: "Project History", done: true, description: "Список проектов с сохранёнными скриптами", files: ["src/app/dashboard/projects/page.tsx", "src/app/dashboard/project/[id]/page.tsx"] },
      { id: "1.7", title: "BullMQ jobs", done: true, description: "generate-ideas → generate-research → generate-script (sequential pipeline)", files: ["src/lib/queue.ts", "src/workers/script-worker.ts"] },
      { id: "1.8", title: "Real-time progress", done: true, description: "Статус генерации в UI (SSE)", files: ["src/app/api/jobs/stream/route.ts", "src/lib/use-job-stream.ts"] },
    ],
  },
  {
    id: "phase-2",
    title: "Multi-Platform",
    icon: Globe,
    color: "text-green-600",
    bgColor: "bg-green-50",
    gate: "Из одной темы — Content Pack с 5 платформами. Время генерации < 2 мин на полный пак.",
    tasks: [
      { id: "2.1", title: "TikTok/Reels/Shorts adapter", done: true, description: "Hook + short script (15–90 сек) + on-screen text + CTA + caption + B-roll", files: ["src/lib/llm.ts"] },
      { id: "2.2", title: "Instagram Carousel adapter", done: true, description: "Hook + структура слайдов (5–10) + тексты + CTA", files: ["src/lib/llm.ts"] },
      { id: "2.3", title: "LinkedIn adapter", done: true, description: "Hook + story/problem + insight + аргументы + CTA", files: ["src/lib/llm.ts"] },
      { id: "2.4", title: "X/Threads adapter", done: true, description: "Короткий пост или thread", files: ["src/lib/llm.ts"] },
      { id: "2.5", title: "Content Pack view", done: true, description: "Единая страница со всеми вариантами по платформам", files: ["src/app/dashboard/project/[id]/pack/page.tsx"] },
      { id: "2.6", title: "BullMQ fan-out", done: true, description: "Параллельная генерация 5 платформ из одного research-блока", files: ["src/app/api/generate/pack/route.ts"] },
      { id: "2.7", title: "Export", done: true, description: "Копирование в буфер, экспорт в Markdown/TXT", files: ["src/app/dashboard/project/[id]/pack/page.tsx"] },
    ],
  },
  {
    id: "phase-3",
    title: "Credits & Monetization",
    icon: CreditCard,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    gate: "Первые реальные платежи. Target: >5% конверсия из регистрации в покупку.",
    tasks: [
      { id: "3.1", title: "Credits system", done: true, description: "Покупка паков начисляет кредиты (1 сценарий = 1 кредит), баланс в UI", files: ["src/app/api/credits/route.ts", "src/lib/use-credits.ts"] },
      { id: "3.2", title: "Stripe Checkout", done: true, description: "Реальные платежи (production mode)", files: ["src/app/api/checkout/route.ts"] },
      { id: "3.3", title: "Usage tracking", done: true, description: "Логирование использования кредитов по платформам", files: ["src/app/api/credits/deduct/route.ts"] },
      { id: "3.4", title: "Paywall", done: true, description: "Бесплатный пользователь видит превью, полный скрипт — за кредит", files: ["src/app/dashboard/project/generate/page.tsx"] },
      { id: "3.5", title: "Landing page", done: true, description: "Маркетинговая страница с примерами, ценами, CTA", files: ["src/app/page.tsx"] },
    ],
  },
  {
    id: "phase-4",
    title: "Quality & UX Polish",
    icon: Star,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    gate: "NPS > 30, средняя оценка сценария > 3.5/5, repeat purchase rate > 20%.",
    tasks: [
      { id: "4.1", title: "Feedback loop", done: true, description: "Thumb up/down на каждый блок, сбор оценок", files: ["src/components/feedback-buttons.tsx", "src/app/api/feedback/route.ts"] },
      { id: "4.2", title: "Regeneration UX", done: true, description: "Перегенерация с параметрами (tone, length, angle)", files: ["src/app/dashboard/project/generate/page.tsx"] },
      { id: "4.3", title: "Template library", done: true, description: "Предустановленные шаблоны по нишам", files: ["src/components/sections/templates.tsx"] },
      { id: "4.4", title: "Onboarding flow v2", done: true, description: "Guided tour, примеры, 'создай первый скрипт за 2 минуты'", files: ["src/app/dashboard/page.tsx"] },
      { id: "4.5", title: "Performance", done: true, description: "Streaming responses, кеширование research, оптимизация промптов", files: ["src/lib/llm.ts"] },
    ],
  },
  {
    id: "phase-5",
    title: "Growth & Retention",
    icon: TrendingUp,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    tasks: [
      { id: "5.1", title: "Referral program", done: false, description: "'Поделись и получи 1 бесплатный сценарий'" },
      { id: "5.2", title: "Email sequences", done: false, description: "Напоминания, 'осталось N кредитов', новые фичи" },
      { id: "5.3", title: "Community", done: false, description: "Публичная галерея примеров скриптов (anonymized)" },
      { id: "5.4", title: "API access (Pro)", done: false, description: "REST API + документация для программного доступа" },
      { id: "5.5", title: "Localization", done: false, description: "Интерфейс EN/RU, генерация на разных языках" },
    ],
  },
  {
    id: "phase-6",
    title: "AI Pre-production Studio",
    icon: Image,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    tasks: [
      { id: "6.1", title: "Thumbnail concepts", done: false, description: "Генерация 3–5 thumbnail-концептов для YouTube (DALL-E/Flux)" },
      { id: "6.2", title: "Title + Thumbnail scoring", done: false, description: "AI-оценка кликабельности" },
      { id: "6.3", title: "Visual assets", done: false, description: "Covers для Instagram, carousel visuals, инфографики" },
      { id: "6.4", title: "B-roll → stock search", done: false, description: "Интеграция с Pexels/Unsplash API" },
    ],
  },
  {
    id: "phase-7",
    title: "CI/CD & DevOps",
    icon: Settings,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    tasks: [
      { id: "7.1", title: "GitHub Actions", done: false, description: "Lint + type-check + тесты на PR" },
      { id: "7.2", title: "Automated DB migrations", done: false, description: "Prisma migrate в CI" },
      { id: "7.3", title: "Preview deployments", done: false, description: "Vercel PR previews" },
      { id: "7.4", title: "Production deploy pipeline", done: false, description: "main → staging → production с manual gate" },
      { id: "7.5", title: "Monitoring", done: false, description: "Sentry (errors) + Vercel Analytics (perf) + BullMQ Dashboard" },
      { id: "7.6", title: "Backup strategy", done: false, description: "Automated Postgres backups, Redis persistence" },
    ],
  },
];

function TaskItem({ task }: { task: Task }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="group">
      <div
        className="flex items-start gap-3 py-2 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="mt-0.5 shrink-0">
          {task.done ? (
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <Check size={12} className="text-white" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">
              {task.id}
            </span>
            <span
              className={cn(
                "text-sm",
                task.done ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {task.title}
            </span>
            {task.files && task.files.length > 0 && (
              <span className="text-xs text-muted-foreground/50">
                {task.files.length} file{task.files.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
          {expanded && task.description && (
            <p className="text-xs text-muted-foreground mt-1">
              {task.description}
            </p>
          )}
          {expanded && task.files && task.files.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {task.files.map((file) => (
                <span
                  key={file}
                  className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono"
                >
                  {file}
                </span>
              ))}
            </div>
          )}
        </div>
        {task.files && task.files.length > 0 && (
          <div className="shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
        )}
      </div>
    </div>
  );
}

function PhaseCard({ phase }: { phase: Phase }) {
  const [expanded, setExpanded] = useState(true);
  const completedCount = phase.tasks.filter((t) => t.done).length;
  const totalCount = phase.tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isComplete = completedCount === totalCount;
  const Icon = phase.icon;

  return (
    <div
      className={cn(
        "border rounded-[16px] overflow-hidden transition-all",
        isComplete
          ? "border-green-200 bg-green-50/30"
          : "border-border bg-card"
      )}
    >
      {/* Phase header */}
      <div
        className="flex items-center justify-between px-6 py-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              isComplete ? "bg-green-100" : phase.bgColor
            )}
          >
            <Icon
              size={20}
              className={isComplete ? "text-green-600" : phase.color}
            />
          </div>
          <div>
            <h3 className="font-heading text-lg">{phase.title}</h3>
            <p className="text-xs text-muted-foreground">
              {completedCount} / {totalCount} tasks completed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Progress bar */}
          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden hidden sm:block">
            <div
              className={cn(
                "h-full transition-all duration-500 rounded-full",
                isComplete ? "bg-green-500" : "bg-foreground"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Percentage */}
          <span
            className={cn(
              "text-sm font-medium w-12 text-right",
              isComplete ? "text-green-600" : "text-muted-foreground"
            )}
          >
            {Math.round(progress)}%
          </span>
          {/* Expand icon */}
          <div className="text-muted-foreground">
            {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </div>
        </div>
      </div>

      {/* Tasks */}
      {expanded && (
        <div className="px-6 pb-4">
          <div className="border-t border-border/50 pt-3">
            {phase.tasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
          {phase.gate && (
            <div className="mt-4 p-3 bg-muted/50 rounded-[10px]">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Gate:
              </p>
              <p className="text-xs text-muted-foreground">{phase.gate}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RoadmapPage() {
  const totalTasks = phases.reduce((acc, p) => acc + p.tasks.length, 0);
  const completedTasks = phases.reduce(
    (acc, p) => acc + p.tasks.filter((t) => t.done).length,
    0
  );
  const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center">
              <span className="text-white font-bold text-xs">SF</span>
            </div>
            <span className="font-heading text-lg tracking-tight">
              ScriptForge
            </span>
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard →
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-[1000px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading text-4xl mb-2">Implementation Roadmap</h1>
            <p className="text-muted-foreground mb-6">
              AI Content Script Studio — от идеи до продакшена
            </p>

            {/* Overall progress */}
            <div className="bg-card border border-border rounded-[16px] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium">Overall Progress</p>
                  <p className="text-xs text-muted-foreground">
                    {completedTasks} of {totalTasks} tasks completed
                  </p>
                </div>
                <span className="text-3xl font-heading">
                  {Math.round(overallProgress)}%
                </span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground transition-all duration-1000 rounded-full"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-muted-foreground">Phase 0</span>
                <span className="text-xs text-muted-foreground">Phase 7</span>
              </div>
            </div>
          </div>

          {/* Tech stack */}
          <div className="mb-8">
            <h2 className="font-heading text-xl mb-3">Tech Stack</h2>
            <div className="flex flex-wrap gap-2">
              {[
                "Next.js 16",
                "TypeScript",
                "Tailwind CSS",
                "shadcn/ui",
                "PostgreSQL",
                "Prisma",
                "BullMQ",
                "Redis",
                "Stripe",
                "OpenAI API",
                "NextAuth.js",
              ].map((tech) => (
                <span
                  key={tech}
                  className="text-xs bg-muted px-2.5 py-1 rounded-full"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Phases */}
          <div className="space-y-4">
            {phases.map((phase) => (
              <PhaseCard key={phase.id} phase={phase} />
            ))}
          </div>

          {/* Risk Register */}
          <div className="mt-12">
            <h2 className="font-heading text-2xl mb-4">Risk Register</h2>
            <div className="bg-card border border-border rounded-[16px] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                      Risk
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                      Impact
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                      Mitigation
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      risk: "LLM-сценарии не дотягивают до качества Fiverr-райтеров",
                      impact: "High",
                      mitigation: "Feedback loop, prompt optimization, human review samples",
                    },
                    {
                      risk: "Низкая willingness-to-pay",
                      impact: "High",
                      mitigation: "Fiverr benchmark $5–30; наша цена ниже; $4.99 try-it",
                    },
                    {
                      risk: "ChatGPT/Claude как substitute",
                      impact: "Medium",
                      mitigation: "Workflow + Creator Profile + multi-platform pack",
                    },
                    {
                      risk: "Стоимость LLM API при масштабировании",
                      impact: "Medium",
                      mitigation: "Кеширование research, модели разного уровня, batch",
                    },
                  ].map((item, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="px-6 py-3 text-sm">{item.risk}</td>
                      <td className="px-6 py-3">
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            item.impact === "High"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          )}
                        >
                          {item.impact}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-muted-foreground">
                        {item.mitigation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Success Metrics */}
          <div className="mt-8 mb-12">
            <h2 className="font-heading text-2xl mb-4">Success Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { metric: "Registered users", target: "500", timeframe: "8 weeks post-launch" },
                { metric: "Conversion to purchase", target: ">5%", timeframe: "8 weeks" },
                { metric: "Repeat purchase rate", target: ">20%", timeframe: "Month 2–3" },
                { metric: "Avg script rating", target: ">3.5/5", timeframe: "Ongoing" },
                { metric: "Revenue", target: ">$500 MRR", timeframe: "Month 3" },
                { metric: "Time-to-first-script", target: "<3 min", timeframe: "Onboarding" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-[12px] p-4"
                >
                  <p className="text-sm font-medium mb-1">{item.metric}</p>
                  <p className="text-2xl font-heading mb-1">{item.target}</p>
                  <p className="text-xs text-muted-foreground">{item.timeframe}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
