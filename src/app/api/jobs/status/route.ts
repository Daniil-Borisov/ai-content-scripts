import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generationQueue } from "@/lib/queue";

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "jobId required" }, { status: 400 });
  }

  try {
    const job = await generationQueue.getJob(jobId);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Verify job ownership
    if (job.data.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const state = await job.getState();
    const progress = job.progress;
    const result = job.returnvalue;
    const failedReason = job.failedReason;

    return NextResponse.json({
      id: job.id,
      type: job.data.type,
      state,
      progress,
      result,
      failedReason,
    });
  } catch (error) {
    console.error("Job status error");
    return NextResponse.json(
      { error: "Failed to get job status" },
      { status: 500 }
    );
  }
}
