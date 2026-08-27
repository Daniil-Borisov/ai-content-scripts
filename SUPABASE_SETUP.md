# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose organization (or create one)
4. Enter project details:
   - Name: `ai-content-studio`
   - Database Password: (save this!)
   - Region: Choose closest to you
5. Click "Create project"

## 2. Get Connection String

1. Go to Project Settings → Database
2. Find "Connection string" → "URI"
3. Copy the connection string, it looks like:
   ```
   postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

## 3. Update .env

Replace the DATABASE_URL in `.env`:

```env
DATABASE_URL="postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
```

## 4. Run Prisma Migrations

```bash
npx prisma db push
```

## 5. Get API Keys

1. Go to Project Settings → API
2. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 6. Update .env with Supabase Keys

```env
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON-KEY]"
```
