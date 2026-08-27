import { Worker, Job } from "bullmq";
import { PrismaClient } from "@prisma/client";
import { generateIdeas, generateResearch, generateScript } from "../lib/llm";
import type { GenerationJobData } from "../lib/queue";

const db = new PrismaClient();

const connection = {
  url: process.env.REDIS_URL || "redis://localhost:6379",
};

async function handleIdeas(job: Job<GenerationJobData>) {
  const data = job.data;
  if (data.type !== "ideas") return;

  console.log(`[Worker] Generating ideas for topic: ${data.topic}`);
  await job.updateProgress(10);

  try {
    const ideas = await generateIdeas(data.topic, data.profile);
    console.log(`[Worker] Generated ${ideas.length} ideas`);

    // Save project to database
    const project = await db.project.create({
      data: {
        userId: data.userId,
        title: `Content ideas: ${data.topic}`,
        topic: data.topic,
        status: "ideas_generated",
      },
    });

    console.log(`[Worker] Project created: ${project.id}`);
    await job.updateProgress(100);

    return { ideas, projectId: project.id };
  } catch (error) {
    console.error(`[Worker] Error generating ideas:`, error);
    throw error;
  }
}

async function handleResearch(job: Job<GenerationJobData>) {
  const data = job.data;
  if (data.type !== "research") return;

  console.log(`[Worker] Generating research for: ${data.topic} - ${data.idea}`);
  await job.updateProgress(10);

  try {
    const research = await generateResearch(data.topic, data.idea, data.profile);
    console.log(`[Worker] Research generated with ${research.keyFacts?.length || 0} facts`);

    // Find or create project
    let project = await db.project.findFirst({
      where: { userId: data.userId, topic: data.topic },
      orderBy: { createdAt: "desc" },
    });

    if (!project) {
      project = await db.project.create({
        data: {
          userId: data.userId,
          title: data.idea || data.topic,
          topic: data.topic,
          status: "researching",
        },
      });
    }

    // Update project status
    await db.project.update({
      where: { id: project.id },
      data: { status: "research_complete" },
    });

    console.log(`[Worker] Project updated: ${project.id}`);
    await job.updateProgress(100);

    return { research, projectId: project.id };
  } catch (error) {
    console.error(`[Worker] Error generating research:`, error);
    throw error;
  }
}

async function handleScript(job: Job<GenerationJobData>) {
  const data = job.data;
  if (data.type !== "script") return;

  console.log(`[Worker] Generating ${data.platform} script for: ${data.topic}`);
  await job.updateProgress(10);

  try {
    const script = await generateScript(
      data.topic,
      data.idea,
      data.research,
      data.platform,
      data.profile
    );
    console.log(`[Worker] Script generated: ${script.title}`);

    // Find or create project
    let project = await db.project.findFirst({
      where: { userId: data.userId, topic: data.topic },
      orderBy: { createdAt: "desc" },
    });

    if (!project) {
      project = await db.project.create({
        data: {
          userId: data.userId,
          title: data.idea || data.topic,
          topic: data.topic,
          status: "generating",
        },
      });
    }

    // Create script record
    const scriptRecord = await db.script.create({
      data: {
        projectId: project.id,
        platform: data.platform,
        status: "completed",
        content: {
          title: script.title,
          description: script.description,
          generatedAt: new Date().toISOString(),
        },
      },
    });

    // Create script blocks
    if (script.blocks && script.blocks.length > 0) {
      await db.scriptBlock.createMany({
        data: script.blocks.map((block, index) => ({
          scriptId: scriptRecord.id,
          type: block.type,
          content: block.content,
          order: block.order || index,
        })),
      });
    }

    // Update project status
    await db.project.update({
      where: { id: project.id },
      data: { status: "completed" },
    });

    console.log(`[Worker] Script saved to DB: ${scriptRecord.id} with ${script.blocks?.length || 0} blocks`);
    await job.updateProgress(100);

    return { script, scriptId: scriptRecord.id, projectId: project.id };
  } catch (error) {
    console.error(`[Worker] Error generating script:`, error);
    throw error;
  }
}

const worker = new Worker(
  "content-generation",
  async (job: Job<GenerationJobData>) => {
    const { type } = job.data;
    console.log(`[Worker] Processing ${type} job ${job.id}`);

    switch (type) {
      case "ideas":
        return handleIdeas(job);
      case "research":
        return handleResearch(job);
      case "script":
        return handleScript(job);
      default:
        throw new Error(`Unknown job type: ${type}`);
    }
  },
  {
    connection,
    concurrency: 3,
    limiter: {
      max: 10,
      duration: 60000,
    },
  }
);

worker.on("completed", (job) => {
  console.log(`[Worker] ✓ Job ${job.id} (${job.data.type}) completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[Worker] ✗ Job ${job?.id} (${job?.data?.type}) failed:`, err.message);
});

worker.on("progress", (job, progress) => {
  console.log(`[Worker] Job ${job.id} progress: ${progress}%`);
});

console.log("[Worker] Content generation worker started");
console.log("[Worker] Redis URL:", process.env.REDIS_URL || "redis://localhost:6379");
console.log("[Worker] OpenAI base URL:", process.env.OPENAI_BASE_URL || "https://api.openai.com/v1");

export default worker;
