import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateThumbnailConcepts } from "@/lib/llm";

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
    const concepts = await generateThumbnailConcepts(
      title,
      topic,
      platform || "youtube"
    );

    return NextResponse.json({ concepts });
  } catch (error) {
    console.error("Generate thumbnails error:", error);
    return NextResponse.json(
      { error: "Failed to generate thumbnail concepts" },
      { status: 500 }
    );
  }
}
