import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const credit = await db.credit.findUnique({
      where: { userId: session.user.id || "" },
    });

    return NextResponse.json({
      balance: credit?.balance || 0,
      totalUsed: credit?.totalUsed || 0,
    });
  } catch (error) {
    console.error("Fetch credits error:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}

// POST removed - credits can only be added through Stripe webhook
