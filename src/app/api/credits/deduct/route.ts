import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { amount, description } = await req.json();

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  try {
    const userId = session.user.id || "";

    // Check balance
    const credit = await db.credit.findUnique({
      where: { userId },
    });

    if (!credit || credit.balance < amount) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 400 }
      );
    }

    // Deduct credits
    const updated = await db.credit.update({
      where: { userId },
      data: {
        balance: { decrement: amount },
        totalUsed: { increment: amount },
      },
    });

    return NextResponse.json({
      balance: updated.balance,
      totalUsed: updated.totalUsed,
      deducted: amount,
      description,
    });
  } catch (error) {
    console.error("Deduct credits error:", error);
    return NextResponse.json(
      { error: "Failed to deduct credits" },
      { status: 500 }
    );
  }
}
