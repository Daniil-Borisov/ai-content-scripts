import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateVisualAssets } from "@/lib/llm";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, topic, platform } = await req.json();

  if (!title || !topic) {
    return NextResponse.json({ error: "Title and topic required" }, { status: 400 });
  }

  try {
    const result = await generateVisualAssets(
      title,
      topic,
      platform || "instagram"
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Generate visuals error:", error);
    return NextResponse.json(
      { error: "Failed to generate visual assets" },
      { status: 500 }
    );
  }
}
