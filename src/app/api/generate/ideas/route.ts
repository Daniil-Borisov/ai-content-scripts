import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { enqueueJob } from "@/lib/queue";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { topic, profile } = body;

  if (!topic) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 });
  }

  try {
    const jobId = await enqueueJob({
      type: "ideas",
      userId: session.user.id || "",
      topic,
      profile: profile || {
        niche: "General",
        audience: "General audience",
        toneOfVoice: "Conversational",
      },
    });

    return NextResponse.json({ jobId });
  } catch (error) {
    console.error("Enqueue ideas error:", error);
    return NextResponse.json(
      { error: "Failed to enqueue job" },
      { status: 500 }
    );
  }
}
