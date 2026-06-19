// =====================================================================
// CarGuard AI — AI provider layer (hybrid)
//   • Vision (photos, document images) → Anthropic Claude
//   • Media (full video + audio)       → Google Gemini (native A/V)
// Uses plain fetch (no SDK dependency). SERVER ONLY.
// Callers wrap these in try/catch and provide cautious mock fallbacks,
// so a missing key or a failed call degrades gracefully.
// =====================================================================

// ---- Provider keys & models ----------------------------------------
const anthropicKey = () => process.env.ANTHROPIC_API_KEY;
const geminiKey = () => process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

// Claude vision model. Override with ANTHROPIC_VISION_MODEL (e.g. a cheaper
// Sonnet for high-volume image analysis).
export const VISION_MODEL = process.env.ANTHROPIC_VISION_MODEL || "claude-opus-4-8";
// Gemini model for video + audio. Override with GEMINI_MODEL.
export const MEDIA_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

// Inline-data ceiling for Gemini (the request must stay well under ~20 MB).
const INLINE_MEDIA_LIMIT = 18 * 1024 * 1024;

export function isVisionConfigured(): boolean {
  return Boolean(anthropicKey());
}
export function isMediaConfigured(): boolean {
  return Boolean(geminiKey());
}
// Broad gate kept for existing callers: true if any provider is configured.
export function isAIConfigured(): boolean {
  return isVisionConfigured() || isMediaConfigured();
}

// Robustly extract a JSON object from a model response (strips code fences /
// stray prose the model may add around the JSON).
function parseJson<T>(text: string): T {
  const t = (text ?? "").trim();
  if (!t) throw new Error("Empty AI response.");
  try {
    return JSON.parse(t) as T;
  } catch {
    const fenced = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    try {
      return JSON.parse(fenced) as T;
    } catch {
      const start = t.indexOf("{");
      const end = t.lastIndexOf("}");
      if (start !== -1 && end > start) {
        return JSON.parse(t.slice(start, end + 1)) as T;
      }
      throw new Error("AI response was not valid JSON.");
    }
  }
}

// ---- Vision (Anthropic Claude) -------------------------------------
interface VisionCallOptions {
  system: string;
  userText: string;
  imageUrls?: string[];
  temperature?: number;
}

export async function runStructuredVision<T>(opts: VisionCallOptions): Promise<T> {
  const key = anthropicKey();
  if (!key) throw new Error("ANTHROPIC_API_KEY is not configured.");

  const content: unknown[] = [];
  for (const url of opts.imageUrls ?? []) {
    content.push({ type: "image", source: { type: "url", url } });
  }
  content.push({
    type: "text",
    text: `${opts.userText}\n\nRespond with ONLY the JSON object described above — no prose, no markdown, no code fences.`,
  });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: VISION_MODEL,
      max_tokens: 4096,
      system: opts.system,
      messages: [{ role: "user", content }],
    }),
  });
  if (!res.ok) {
    throw new Error(`Anthropic vision error ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = (data.content ?? [])
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("");
  return parseJson<T>(text);
}

// ---- Media: full video + audio (Google Gemini) ---------------------
interface MediaCallOptions {
  system: string;
  userText: string;
  /** Base64-encoded media payload (audio or video). */
  base64: string;
  /** MIME type, e.g. "video/mp4", "audio/mpeg", "audio/wav". */
  mimeType: string;
  temperature?: number;
}

export function mediaFitsInline(base64: string): boolean {
  // base64 is ~4/3 the byte size; compare decoded size to the inline ceiling.
  return Math.floor((base64.length * 3) / 4) <= INLINE_MEDIA_LIMIT;
}

export async function runStructuredMedia<T>(opts: MediaCallOptions): Promise<T> {
  const key = geminiKey();
  if (!key) throw new Error("GEMINI_API_KEY is not configured.");
  if (!mediaFitsInline(opts.base64)) {
    throw new Error("Media too large for inline analysis.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MEDIA_MODEL}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: opts.system }] },
      contents: [
        {
          role: "user",
          parts: [
            { inline_data: { mime_type: opts.mimeType, data: opts.base64 } },
            { text: `${opts.userText}\n\nRespond with ONLY a JSON object.` },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: opts.temperature ?? 0.2,
      },
    }),
  });
  if (!res.ok) {
    throw new Error(`Gemini media error ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = (data.candidates?.[0]?.content?.parts ?? [])
    .map((p) => p.text ?? "")
    .join("");
  return parseJson<T>(text);
}

// Back-compat wrapper for audio-only callers.
export async function runStructuredAudio<T>(opts: {
  system: string;
  userText: string;
  audioBase64: string;
  mimeType: string;
  temperature?: number;
}): Promise<T> {
  return runStructuredMedia<T>({
    system: opts.system,
    userText: opts.userText,
    base64: opts.audioBase64,
    mimeType: opts.mimeType,
    temperature: opts.temperature,
  });
}
