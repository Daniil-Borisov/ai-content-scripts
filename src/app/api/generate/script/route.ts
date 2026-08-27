import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { enqueueJob } from "@/lib/queue";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { topic, idea, research, platform, profile, regenerateBlock, existingBlocks } = body;

  if (!topic || !idea || !research || !platform) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const jobId = await enqueueJob({
      type: "script",
      userId: session.user.id || "",
      topic,
      idea,
      research,
      platform,
      profile: profile || {
        niche: "General",
        audience: "General audience",
        toneOfVoice: "Conversational",
      },
      regenerateBlock,
      existingBlocks,
    });

    return NextResponse.json({ jobId });
  } catch (error) {
    console.error("Enqueue script error:", error);
    return NextResponse.json(
      { error: "Failed to enqueue job" },
      { status: 500 }
    );
  }
}
