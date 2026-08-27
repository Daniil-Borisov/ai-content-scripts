import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, PACKS, type PackKey } from "@/lib/stripe";
import { z } from "zod";

const checkoutSchema = z.object({
  pack: z.enum(["try_it", "starter", "creator", "pro"]),
});

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
  }

  const { pack } = parsed.data;
  const selectedPack = PACKS[pack];

  try {
    // Create checkout session with idempotency key
    // This prevents duplicate sessions for the same user+pack+time
    const idempotencyKey = `checkout_${session.user.id}_${pack}_${Math.floor(Date.now() / 60000)}`;

    const checkoutSession = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: session.user.email!,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `ScriptForge ${selectedPack.name} Pack`,
                description: `${selectedPack.credits} script credits`,
              },
              unit_amount: selectedPack.price,
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId: session.user.id || "",
          pack,
          credits: selectedPack.credits.toString(),
        },
        success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
        cancel_url: `${process.env.NEXTAUTH_URL}/#pricing?canceled=true`,
      },
      {
        idempotencyKey,
      }
    );

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error");
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
