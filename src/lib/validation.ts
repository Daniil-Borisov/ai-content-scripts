import { z } from "zod";

// Common schemas
export const emailSchema = z.string().email().max(255);
export const passwordSchema = z.string().min(8).max(128);
export const nameSchema = z.string().min(1).max(100);
export const topicSchema = z.string().min(1).max(500);
export const ideaSchema = z.string().min(1).max(1000);
export const platformSchema = z.enum([
  "youtube",
  "tiktok",
  "reels",
  "shorts",
  "instagram",
  "linkedin",
  "x",
]);

export const profileSchema = z.object({
  niche: z.string().min(1).max(100),
  audience: z.string().min(1).max(500),
  toneOfVoice: z.string().min(1).max(100),
  style: z.string().max(500).optional(),
});

// Request schemas
export const generateIdeasSchema = z.object({
  topic: topicSchema,
  profile: profileSchema.optional(),
});

export const generateResearchSchema = z.object({
  topic: topicSchema,
  idea: ideaSchema,
  profile: profileSchema.optional(),
});

export const generateScriptSchema = z.object({
  topic: topicSchema,
  idea: ideaSchema,
  research: z.object({
    keyFacts: z.array(z.string()).min(1).max(10),
    insights: z.array(z.string()).min(1).max(10),
    statistics: z.array(z.string()).min(1).max(10),
  }),
  platform: platformSchema,
  profile: profileSchema.optional(),
  regenerateBlock: z.string().max(50).optional(),
  existingBlocks: z
    .array(
      z.object({
        type: z.string(),
        content: z.string(),
        order: z.number(),
      })
    )
    .optional(),
});

export const generatePackSchema = z.object({
  topic: topicSchema,
  idea: ideaSchema,
  research: z.object({
    keyFacts: z.array(z.string()).min(1),
    insights: z.array(z.string()).min(1),
    statistics: z.array(z.string()).min(1),
  }),
  platforms: z.array(platformSchema).min(1).max(7),
  profile: profileSchema.optional(),
});

export const feedbackSchema = z.object({
  scriptId: z.string().min(1),
  blockId: z.string().optional(),
  rating: z.enum(["up", "down"]),
  comment: z.string().max(1000).optional(),
});

export const deductCreditsSchema = z.object({
  amount: z.number().int().positive().max(100),
  description: z.string().max(200).optional(),
});
