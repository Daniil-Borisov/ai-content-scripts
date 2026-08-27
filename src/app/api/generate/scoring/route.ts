import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { scoreTitleThumbnail } from "@/lib/llm";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, thumbnailDescription } = await req.json();

  if (!title) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  try {
    const score = await scoreTitleThumbnail(title, thumbnailDescription);

    return NextResponse.json({ score });
  } catch (error) {
    console.error("Score error:", error);
    return NextResponse.json(
      { error: "Failed to score" },
      { status: 500 }
    );
  }
}
