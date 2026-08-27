import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  timeout: 120000, // 2 minutes timeout
});

const JSON_INSTRUCTION =
  "\n\nIMPORTANT: Respond ONLY with a valid JSON object. No markdown formatting, no code blocks, no explanation — just the raw JSON.";

function repairJson(json: string): string {
  // Count open/close brackets and braces
  let braces = 0;
  let brackets = 0;
  let inString = false;
  let escape = false;

  for (const char of json) {
    if (escape) { escape = false; continue; }
    if (char === "\\") { escape = true; continue; }
    if (char === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (char === "{") braces++;
    if (char === "}") braces--;
    if (char === "[") brackets++;
    if (char === "]") brackets--;
  }

  // If we're in a string, close it
  if (inString) json += '"';

  // Close any open arrays/objects
  while (brackets > 0) { json += "]"; brackets--; }
  while (braces > 0) { json += "}"; braces--; }

  return json;
}

function safeJsonParse<T>(content: string): T {
  // Try direct parse first
  try {
    return JSON.parse(content);
  } catch {
    // fall through
  }

  // Try to extract JSON from markdown code blocks
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // fall through
    }
  }

  // Try to find first { and last }
  const firstBrace = content.indexOf("{");
  const lastBrace = content.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(content.substring(firstBrace, lastBrace + 1));
    } catch {
      // fall through
    }
  }

  // Try to find first [ and last ]
  const firstBracket = content.indexOf("[");
  const lastBracket = content.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    try {
      return JSON.parse(content.substring(firstBracket, lastBracket + 1));
    } catch {
      // fall through
    }
  }

  // Try to repair truncated JSON
  const jsonStart = content.indexOf("{");
  const arrayStart = content.indexOf("[");
  const start = jsonStart !== -1 ? jsonStart : arrayStart;

  if (start !== -1) {
    const partial = content.substring(start);
    try {
      const repaired = repairJson(partial);
      return JSON.parse(repaired);
    } catch {
      // fall through
    }
  }

  throw new Error(`Failed to parse JSON from response: ${content.substring(0, 200)}`);
}

export async function generateIdeas(
  topic: string,
  profile: {
    niche: string;
    audience: string;
    toneOfVoice: string;
    style?: string;
  }
): Promise<string[]> {
  const response = await openai.chat.completions.create({
    model: "mimo-v2.5",
    messages: [
      {
        role: "system",
        content: `You are a content strategy expert. Generate content ideas for a creator with this profile:
- Niche: ${profile.niche}
- Audience: ${profile.audience}
- Tone: ${profile.toneOfVoice}
- Style: ${profile.style || "default"}

Return a JSON object with an "ideas" array containing exactly 10 unique content angles. Each should be a compelling content idea/hook.${JSON_INSTRUCTION}`,
      },
      {
        role: "user",
        content: `Generate 10 content angles for the topic: "${topic}"`,
      },
    ],
    temperature: 0.8,
    max_tokens: 2000,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No content generated");

  const parsed = safeJsonParse<Record<string, unknown>>(content);
  if (Array.isArray(parsed)) return parsed as string[];
  return (parsed.ideas || parsed.angles || []) as string[];
}

export async function generateResearch(
  topic: string,
  idea: string,
  profile: {
    niche: string;
    audience: string;
    toneOfVoice: string;
  }
): Promise<{
  keyFacts: string[];
  insights: string[];
  sources: string[];
  statistics: string[];
  expertQuotes: string[];
}> {
  const response = await openai.chat.completions.create({
    model: "mimo-v2.5",
    messages: [
      {
        role: "system",
        content: `You are a research assistant for content creators. Generate comprehensive research for a content piece.

Creator profile:
- Niche: ${profile.niche}
- Audience: ${profile.audience}
- Tone: ${profile.toneOfVoice}

Return a JSON object with these fields:
- keyFacts: array of 5-8 key facts about the topic
- insights: array of 3-5 unique insights or angles
- sources: array of 3-5 credible source suggestions
- statistics: array of 3-5 relevant statistics or data points
- expertQuotes: array of 2-3 expert perspectives${JSON_INSTRUCTION}`,
      },
      {
        role: "user",
        content: `Research this topic and idea:
Topic: "${topic}"
Angle: "${idea}"`,
      },
    ],
    temperature: 0.7,
    max_tokens: 6000,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No research generated");

  return safeJsonParse(content);
}

export async function generateScript(
  topic: string,
  idea: string,
  research: {
    keyFacts: string[];
    insights: string[];
    statistics: string[];
  },
  platform: string,
  profile: {
    niche: string;
    audience: string;
    toneOfVoice: string;
    style?: string;
  }
): Promise<{
  blocks: Array<{ type: string; content: string; order: number }>;
  title: string;
  description: string;
}> {
  const platformInstructions: Record<string, string> = {
    youtube: `Full YouTube script with: Hook (first 30s), Introduction, Main content (3-5 sections), Key takeaways, CTA, B-roll suggestions, Title options (3), Description with timestamps`,
    tiktok: `Short-form TikTok script (15-90 seconds): Hook (first 3s), Main content, On-screen text, CTA, Caption with hashtags`,
    reels: `Instagram Reels script (15-90 seconds): Visual hook, Quick value, On-screen text, CTA, Caption`,
    shorts: `YouTube Shorts script (15-60 seconds): Hook, Quick content, CTA, Title, Description`,
    instagram: `Instagram Carousel (5-10 slides): Hook slide, Content slides, CTA slide, Caption`,
    linkedin: `LinkedIn post: Hook line, Story/problem, Key insight, Supporting points, CTA, Hashtags`,
    x: `X/Twitter thread (3-7 tweets): Hook tweet, Key points, CTA tweet, Hashtags`,
  };

  const response = await openai.chat.completions.create({
    model: "mimo-v2.5",
    messages: [
      {
        role: "system",
        content: `You are an expert content scriptwriter. Create a ${platform} script.

Creator profile:
- Niche: ${profile.niche}
- Audience: ${profile.audience}
- Tone: ${profile.toneOfVoice}
- Style: ${profile.style || "default"}

Platform format:
${platformInstructions[platform] || platformInstructions.youtube}

Return a JSON object with:
- blocks: array of {type: string, content: string, order: number}
- title: string
- description: string${JSON_INSTRUCTION}`,
      },
      {
        role: "user",
        content: `Create a ${platform} script for:
Topic: "${topic}"
Angle: "${idea}"

Research:
- Key facts: ${research.keyFacts.join("; ")}
- Insights: ${research.insights.join("; ")}
- Statistics: ${research.statistics.join("; ")}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No script generated");

  return safeJsonParse(content);
}

export async function generateThumbnailConcepts(
  title: string,
  topic: string,
  platform: string
): Promise<Array<{ concept: string; description: string; style: string; colors: string[] }>> {
  const response = await openai.chat.completions.create({
    model: "mimo-v2.5",
    messages: [
      {
        role: "system",
        content: `You are a visual design expert. Generate 5 thumbnail/cover concepts.

Return a JSON object with "concepts" array, each containing:
- concept: short name (2-4 words)
- description: detailed visual description
- style: visual style
- colors: array of 2-3 hex color codes${JSON_INSTRUCTION}`,
      },
      {
        role: "user",
        content: `Generate thumbnail concepts for:
Title: "${title}"
Topic: "${topic}"
Platform: ${platform}`,
      },
    ],
    temperature: 0.8,
    max_tokens: 2000,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No concepts generated");

  const parsed = safeJsonParse<Record<string, unknown>>(content);
  if (Array.isArray(parsed)) return parsed as Array<{ concept: string; description: string; style: string; colors: string[] }>;
  return (parsed.concepts || []) as Array<{ concept: string; description: string; style: string; colors: string[] }>;
}

export async function scoreTitleThumbnail(
  title: string,
  thumbnailDescription?: string
): Promise<{
  overallScore: number;
  titleScore: number;
  thumbnailScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  emotionalTriggers: string[];
}> {
  const response = await openai.chat.completions.create({
    model: "mimo-v2.5",
    messages: [
      {
        role: "system",
        content: `You are a content optimization expert. Score a title and thumbnail for click-through potential (1-100).

Return a JSON object with:
- overallScore, titleScore, thumbnailScore (numbers 1-100)
- strengths, weaknesses, suggestions, emotionalTriggers (arrays of strings)${JSON_INSTRUCTION}`,
      },
      {
        role: "user",
        content: `Score this content:
Title: "${title}"
${thumbnailDescription ? `Thumbnail: ${thumbnailDescription}` : "No thumbnail provided"}`,
      },
    ],
    temperature: 0.5,
    max_tokens: 2000,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No score generated");

  return safeJsonParse(content);
}

export async function generateVisualAssets(
  title: string,
  topic: string,
  platform: string
): Promise<{
  assets: Array<{
    type: string;
    description: string;
    dimensions: string;
    elements: string[];
    textOverlay: string;
  }>;
}> {
  const response = await openai.chat.completions.create({
    model: "mimo-v2.5",
    messages: [
      {
        role: "system",
        content: `You are a visual content designer. Generate detailed specifications for visual assets.

Return a JSON object with "assets" array, each containing:
- type, description, dimensions, elements (array), textOverlay${JSON_INSTRUCTION}`,
      },
      {
        role: "user",
        content: `Generate visual asset specs for:
Title: "${title}"
Topic: "${topic}"
Platform: ${platform}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No assets generated");

  return safeJsonParse(content);
}

export async function suggestBRoll(
  scriptContent: string,
  platform: string
): Promise<{
  suggestions: Array<{
    timestamp: string;
    description: string;
    searchTerms: string[];
    mood: string;
  }>;
}> {
  const response = await openai.chat.completions.create({
    model: "mimo-v2.5",
    messages: [
      {
        role: "system",
        content: `You are a video production expert. Suggest B-roll footage based on a script.

Return a JSON object with "suggestions" array, each containing:
- timestamp, description, searchTerms (array), mood${JSON_INSTRUCTION}`,
      },
      {
        role: "user",
        content: `Suggest B-roll for this ${platform} script:\n\n${scriptContent.substring(0, 2000)}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No B-roll suggestions generated");

  return safeJsonParse(content);
}
