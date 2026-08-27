import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // Check if user already exists (generic message to prevent enumeration)
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Return success to prevent email enumeration
      return NextResponse.json({
        success: true,
        user: { id: existingUser.id, name: existingUser.name, email: existingUser.email },
      });
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    // Create initial credits
    await db.credit.create({
      data: {
        userId: user.id,
        balance: 0,
        totalUsed: 0,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error");
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
