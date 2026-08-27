-- Сиды: тарифные пакеты
-- psql -U ai_content -d ai_content -f scripts/db/03_seed.sql

INSERT INTO "Pack" (id, name, price, credits, "stripePriceId") VALUES
  ('try_it', 'Try it', 4.99, 1, NULL),
  ('starter', 'Starter', 14.99, 5, NULL),
  ('creator', 'Creator', 24.99, 10, NULL),
  ('pro', 'Pro', 49.99, 25, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  credits = EXCLUDED.credits;
