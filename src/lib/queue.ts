import { Queue } from "bullmq";

const connection = {
  url: process.env.REDIS_URL || "redis://localhost:6379",
};

export const generationQueue = new Queue("content-generation", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 100 },
  },
});

export type GenerationJobType = "ideas" | "research" | "script";

export interface IdeasJobData {
  type: "ideas";
  userId: string;
  topic: string;
  profile: {
    niche: string;
    audience: string;
    toneOfVoice: string;
    style?: string;
  };
}

export interface ResearchJobData {
  type: "research";
  userId: string;
  topic: string;
  idea: string;
  profile: {
    niche: string;
    audience: string;
    toneOfVoice: string;
  };
}

export interface ScriptJobData {
  type: "script";
  userId: string;
  topic: string;
  idea: string;
  research: {
    keyFacts: string[];
    insights: string[];
    sources: string[];
    statistics: string[];
    expertQuotes: string[];
  };
  platform: string;
  profile: {
    niche: string;
    audience: string;
    toneOfVoice: string;
    style?: string;
  };
  regenerateBlock?: string;
  existingBlocks?: Array<{ type: string; content: string; order: number }>;
}

export type GenerationJobData = IdeasJobData | ResearchJobData | ScriptJobData;

export async function enqueueJob(data: GenerationJobData): Promise<string> {
  const job = await generationQueue.add(data.type, data, {
    jobId: `${data.type}-${data.userId}-${Date.now()}`,
  });
  return job.id!;
}
