import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { enqueueJob } from "@/lib/queue";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { topic, idea, profile } = body;

  if (!topic || !idea) {
    return NextResponse.json(
      { error: "Topic and idea are required" },
      { status: 400 }
    );
  }

  try {
    const jobId = await enqueueJob({
      type: "research",
      userId: session.user.id || "",
      topic,
      idea,
      profile: profile || {
        niche: "General",
        audience: "General audience",
        toneOfVoice: "Conversational",
      },
    });

    return NextResponse.json({ jobId });
  } catch (error) {
    console.error("Enqueue research error:", error);
    return NextResponse.json(
      { error: "Failed to enqueue job" },
      { status: 500 }
    );
  }
}
