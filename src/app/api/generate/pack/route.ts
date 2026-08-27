import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { enqueueJob } from "@/lib/queue";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id || "";

  const body = await req.json();
  const { topic, idea, research, platforms, profile } = body;

  if (!topic || !idea || !research || !platforms?.length) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const jobIds = await Promise.all(
      platforms.map((platform: string) =>
        enqueueJob({
          type: "script",
          userId,
          topic,
          idea,
          research,
          platform,
          profile: profile || {
            niche: "General",
            audience: "General audience",
            toneOfVoice: "Conversational",
          },
        })
      )
    );

    return NextResponse.json({
      jobIds: platforms.map((platform: string, i: number) => ({
        platform,
        jobId: jobIds[i],
      })),
    });
  } catch (error) {
    console.error("Enqueue content pack error:", error);
    return NextResponse.json(
      { error: "Failed to enqueue jobs" },
      { status: 500 }
    );
  }
}
