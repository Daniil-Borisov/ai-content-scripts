import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { blockId, scriptId, rating, comment } = await req.json();

  if (!scriptId || !rating || !["up", "down"].includes(rating)) {
    return NextResponse.json({ error: "Invalid feedback" }, { status: 400 });
  }

  try {
    // Store feedback as a JSON field on the script block
    // For now, we'll use a simple approach with the script's content field
    const script = await db.script.findFirst({
      where: {
        id: scriptId,
        project: { userId: session.user.id || "" },
      },
    });

    if (!script) {
      return NextResponse.json({ error: "Script not found" }, { status: 404 });
    }

    // Update the block's metadata with feedback
    const content = (script.content as Record<string, unknown>) || {};
    const feedback = (content.feedback as Record<string, unknown>) || {};
    feedback[blockId || "general"] = {
      rating,
      comment: comment || null,
      timestamp: new Date().toISOString(),
    };

    const updatedContent = {
      ...content,
      feedback,
    } as Record<string, unknown>;

    await db.script.update({
      where: { id: scriptId },
      data: {
        content: updatedContent as any,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json(
      { error: "Failed to save feedback" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const scriptId = searchParams.get("scriptId");

  if (!scriptId) {
    return NextResponse.json({ error: "scriptId required" }, { status: 400 });
  }

  try {
    const script = await db.script.findFirst({
      where: {
        id: scriptId,
        project: { userId: session.user.id || "" },
      },
    });

    if (!script) {
      return NextResponse.json({ error: "Script not found" }, { status: 404 });
    }

    const content = (script.content as Record<string, unknown>) || {};
    const feedback = (content.feedback as Record<string, unknown>) || {};

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Fetch feedback error:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}
