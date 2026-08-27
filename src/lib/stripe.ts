import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-07-29.dahlia",
  typescript: true,
});

export const PACKS = {
  try_it: {
    name: "Try it",
    price: 499,
    credits: 1,
    stripePriceId: process.env.STRIPE_PRICE_TRY_IT,
  },
  starter: {
    name: "Starter",
    price: 1499,
    credits: 5,
    stripePriceId: process.env.STRIPE_PRICE_STARTER,
  },
  creator: {
    name: "Creator",
    price: 2499,
    credits: 10,
    stripePriceId: process.env.STRIPE_PRICE_CREATOR,
  },
  pro: {
    name: "Pro",
    price: 4999,
    credits: 25,
    stripePriceId: process.env.STRIPE_PRICE_PRO,
  },
} as const;

export type PackKey = keyof typeof PACKS;
