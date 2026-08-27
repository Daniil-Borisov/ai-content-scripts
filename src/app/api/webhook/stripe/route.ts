import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotency: check if this event was already processed
  const existingPurchase = await db.purchase.findFirst({
    where: { stripePaymentId: event.id },
  });

  if (existingPurchase) {
    // Already processed, return success
    return NextResponse.json({ received: true, duplicate: true });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, pack, credits } = session.metadata!;

    // Validate metadata
    if (!userId || !pack || !credits) {
      return NextResponse.json({ error: "Invalid metadata" }, { status: 400 });
    }

    const creditsAmount = parseInt(credits);
    if (isNaN(creditsAmount) || creditsAmount <= 0 || creditsAmount > 100) {
      return NextResponse.json({ error: "Invalid credits amount" }, { status: 400 });
    }

    // Validate pack exists
    const validPacks = ["try_it", "starter", "creator", "pro"];
    if (!validPacks.includes(pack)) {
      return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
    }

    // Validate user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    // Use transaction to ensure atomicity
    try {
      await db.$transaction(async (tx) => {
        // Create purchase record with event ID for idempotency
        await tx.purchase.create({
          data: {
            userId,
            packId: pack,
            stripePaymentId: event.id, // Use event ID, not payment_intent
            amount: (session.amount_total || 0) / 100,
            credits: creditsAmount,
            status: "completed",
          },
        });

        // Add credits to user
        await tx.credit.upsert({
          where: { userId },
          create: {
            userId,
            balance: creditsAmount,
          },
          update: {
            balance: { increment: creditsAmount },
          },
        });
      });

      return NextResponse.json({ received: true });
    } catch (error) {
      // If transaction fails due to unique constraint, it's a duplicate
      if (
        error instanceof Error &&
        error.message.includes("Unique constraint")
      ) {
        return NextResponse.json({ received: true, duplicate: true });
      }
      throw error;
    }
  }

  return NextResponse.json({ received: true });
}
