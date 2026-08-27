import { auth } from "@/lib/auth";
import { generationQueue } from "@/lib/queue";

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return new Response("jobId required", { status: 400 });
  }

  const userId = session.user.id;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const job = await generationQueue.getJob(jobId);
        if (!job) {
          send({ error: "Job not found", state: "not_found" });
          controller.close();
          return;
        }

        // Verify job ownership
        if (job.data.userId !== userId) {
          send({ error: "Forbidden", state: "forbidden" });
          controller.close();
          return;
        }

        const state = await job.getState();
        send({
          id: job.id,
          type: job.data.type,
          state,
          progress: job.progress,
          result: job.returnvalue,
          failedReason: job.failedReason,
        });

        if (state === "completed" || state === "failed") {
          controller.close();
          return;
        }

        const interval = setInterval(async () => {
          try {
            const job = await generationQueue.getJob(jobId);
            if (!job) {
              clearInterval(interval);
              send({ error: "Job not found", state: "not_found" });
              controller.close();
              return;
            }

            const state = await job.getState();
            send({
              id: job.id,
              type: job.data.type,
              state,
              progress: job.progress,
              result: job.returnvalue,
              failedReason: job.failedReason,
            });

            if (state === "completed" || state === "failed") {
              clearInterval(interval);
              controller.close();
            }
          } catch {
            clearInterval(interval);
            send({ error: "Polling failed", state: "error" });
            controller.close();
          }
        }, 500);

        req.signal.addEventListener("abort", () => {
          clearInterval(interval);
          controller.close();
        });
      } catch {
        send({ error: "Failed to get job", state: "error" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
