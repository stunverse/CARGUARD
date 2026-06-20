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
// Fast, cheap model for INTERACTIVE per-step checks during the wizard (photo
// quality control, mechanical photo) where latency matters more than depth.
// The final report synthesis still uses VISION_MODEL.
export const INTERACTIVE_VISION_MODEL =
  process.env.ANTHROPIC_INTERACTIVE_MODEL || "claude-haiku-4-5";
// Gemini model for video + audio. Override with GEMINI_MODEL.
// Google retired some older ids (404 "no longer available"); ignore those even
// if they're pinned in the environment so analysis never silently breaks.
const RETIRED_GEMINI_MODELS = new Set([
  "gemini-2.0-flash",
  "gemini-2.0-flash-001",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-pro",
]);
const ENV_GEMINI_MODEL = process.env.GEMINI_MODEL?.trim();
export const MEDIA_MODEL =
  ENV_GEMINI_MODEL && !RETIRED_GEMINI_MODELS.has(ENV_GEMINI_MODEL)
    ? ENV_GEMINI_MODEL
    : "gemini-2.5-flash";

// Inline-data ceiling for Gemini (the whole request must stay well under
// ~20 MB). Larger media is uploaded via the Files API and referenced by URI.
const INLINE_MEDIA_LIMIT = 18 * 1024 * 1024;
// Hard ceiling we enforce for uploaded media (Gemini Files API allows up to
// 2 GB/file, but we cap to bound serverless memory + cost — the bytes are held
// in memory as a buffer + base64 string during upload).
const MAX_MEDIA_LIMIT = 200 * 1024 * 1024;

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
  /** Override the model (e.g. a fast model for interactive checks). */
  model?: string;
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
      model: opts.model || VISION_MODEL,
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

// Decoded byte size of a base64 string (without allocating the buffer).
function decodedSize(base64: string): number {
  const len = base64.length;
  if (len === 0) return 0;
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor((len * 3) / 4) - padding;
}

export function mediaFitsInline(base64: string): boolean {
  return decodedSize(base64) <= INLINE_MEDIA_LIMIT;
}

// Media we are willing to analyze at all (inline OR via the Files API).
export function mediaWithinLimit(base64: string): boolean {
  return decodedSize(base64) <= MAX_MEDIA_LIMIT;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface GeminiFile {
  name: string; // e.g. "files/abc123"
  uri: string; // e.g. "https://generativelanguage.googleapis.com/v1beta/files/abc123"
  state: "PROCESSING" | "ACTIVE" | "FAILED" | string;
  mimeType?: string;
  error?: { message?: string };
}

// Upload media to the Gemini Files API using the resumable protocol, then wait
// until the file is ACTIVE (videos need server-side processing). Returns the
// file resource so the caller can reference it by URI. SERVER ONLY.
export async function uploadMediaToGemini(opts: {
  base64: string;
  mimeType: string;
  displayName?: string;
}): Promise<GeminiFile> {
  const key = geminiKey();
  if (!key) throw new Error("GEMINI_API_KEY is not configured.");

  const bytes = Buffer.from(opts.base64, "base64");
  const numBytes = bytes.length;

  // 1) Start a resumable upload session — returns the upload URL in a header.
  const startRes = await fetch(
    `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${key}`,
    {
      method: "POST",
      headers: {
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": String(numBytes),
        "X-Goog-Upload-Header-Content-Type": opts.mimeType,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        file: { display_name: opts.displayName || "carguard-media" },
      }),
    },
  );
  if (!startRes.ok) {
    throw new Error(`Gemini upload start error ${startRes.status}: ${await startRes.text()}`);
  }
  const uploadUrl = startRes.headers.get("x-goog-upload-url");
  if (!uploadUrl) throw new Error("Gemini upload start did not return an upload URL.");

  // 2) Upload the bytes and finalize in a single request.
  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Length": String(numBytes),
      "X-Goog-Upload-Offset": "0",
      "X-Goog-Upload-Command": "upload, finalize",
    },
    body: bytes,
  });
  if (!uploadRes.ok) {
    throw new Error(`Gemini upload error ${uploadRes.status}: ${await uploadRes.text()}`);
  }
  const uploaded = (await uploadRes.json()) as { file?: GeminiFile };
  let file = uploaded.file;
  if (!file?.name) throw new Error("Gemini upload did not return a file resource.");

  // 3) Poll until the file is ACTIVE (or fails). Videos take a few seconds.
  const deadline = Date.now() + 120_000;
  while (file.state === "PROCESSING" && Date.now() < deadline) {
    await sleep(2000);
    const statRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${file.name}?key=${key}`,
    );
    if (!statRes.ok) {
      throw new Error(`Gemini file status error ${statRes.status}: ${await statRes.text()}`);
    }
    file = (await statRes.json()) as GeminiFile;
  }
  if (file.state === "FAILED") {
    throw new Error(`Gemini file processing failed: ${file.error?.message ?? "unknown error"}`);
  }
  if (file.state !== "ACTIVE") {
    throw new Error("Gemini file did not become ACTIVE in time.");
  }
  return file;
}

// Best-effort cleanup so uploads don't accumulate against the project quota.
async function deleteGeminiFile(name: string): Promise<void> {
  const key = geminiKey();
  if (!key) return;
  try {
    await fetch(`https://generativelanguage.googleapis.com/v1beta/${name}?key=${key}`, {
      method: "DELETE",
    });
  } catch {
    /* non-fatal */
  }
}

export async function runStructuredMedia<T>(opts: MediaCallOptions): Promise<T> {
  const key = geminiKey();
  if (!key) throw new Error("GEMINI_API_KEY is not configured.");
  if (!mediaWithinLimit(opts.base64)) {
    throw new Error("Media too large for analysis.");
  }

  // Small media goes inline; larger media is uploaded via the Files API and
  // referenced by URI (so we never exceed the inline request ceiling).
  const inline = mediaFitsInline(opts.base64);
  let uploaded: GeminiFile | null = null;
  const mediaPart = inline
    ? { inline_data: { mime_type: opts.mimeType, data: opts.base64 } }
    : await (async () => {
        uploaded = await uploadMediaToGemini({
          base64: opts.base64,
          mimeType: opts.mimeType,
        });
        return { file_data: { mime_type: opts.mimeType, file_uri: uploaded.uri } };
      })();

  try {
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
              mediaPart,
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
  } finally {
    if (uploaded) await deleteGeminiFile((uploaded as GeminiFile).name);
  }
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
