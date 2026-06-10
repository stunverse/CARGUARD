import OpenAI from "openai";

// Vision-capable model used for quality checks + damage analysis.
export const VISION_MODEL = process.env.OPENAI_VISION_MODEL || "gpt-4o";

export function isAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

let _client: OpenAI | null = null;
export function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

interface VisionCallOptions {
  system: string;
  userText: string;
  imageUrls?: string[];
  /** Lower = more deterministic. */
  temperature?: number;
}

/**
 * Run a vision + text chat completion that MUST return a JSON object.
 * Throws if AI is not configured (callers provide mock fallbacks).
 */
export async function runStructuredVision<T>(
  opts: VisionCallOptions,
): Promise<T> {
  const client = getOpenAI();

  const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
    { type: "text", text: opts.userText },
  ];
  for (const url of opts.imageUrls ?? []) {
    content.push({ type: "image_url", image_url: { url, detail: "high" } });
  }

  const completion = await client.chat.completions.create({
    model: VISION_MODEL,
    temperature: opts.temperature ?? 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty AI response.");
  return JSON.parse(raw) as T;
}
