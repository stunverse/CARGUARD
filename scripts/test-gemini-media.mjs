// =====================================================================
// scripts/test-gemini-media.mjs
//
// Standalone end-to-end check that Gemini ANALYZES real media (video/audio)
// the same way the app does (same model, same Files-API path, same JSON-mode
// prompt as analyzeMechanicalVideo / runStructuredMedia).
//
// Usage:
//   GEMINI_API_KEY=xxxx node scripts/test-gemini-media.mjs ./clip.mp4
//   GEMINI_API_KEY=xxxx node scripts/test-gemini-media.mjs ./idle.m4a
//   GEMINI_MODEL=gemini-2.5-flash GEMINI_API_KEY=xxxx node scripts/test-gemini-media.mjs ./clip.mov
//
// It prints the structured JSON Gemini returns (detected issues, summary,
// confidence). A real, populated result = Gemini is analysing the content.
// =====================================================================

import { readFile } from "node:fs/promises";
import { basename, extname } from "node:path";

const KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const INLINE_LIMIT = 18 * 1024 * 1024;

const file = process.argv[2];
if (!KEY) { console.error("✗ Set GEMINI_API_KEY (from aistudio.google.com/apikey)."); process.exit(1); }
if (!file) { console.error("✗ Usage: node scripts/test-gemini-media.mjs <path-to-video-or-audio>"); process.exit(1); }

const MIME = {
  ".wav": "audio/wav", ".mp3": "audio/mp3", ".m4a": "audio/aac", ".aac": "audio/aac",
  ".ogg": "audio/ogg", ".oga": "audio/ogg", ".flac": "audio/flac", ".aiff": "audio/aiff",
  ".mp4": "video/mp4", ".m4v": "video/mp4", ".mov": "video/mov", ".webm": "video/webm",
  ".3gp": "video/3gpp", ".3gpp": "video/3gpp",
};

const SYSTEM = `You are CarGuard AI, a cautious assistant analysing a recording of a car engine.
Be prudent and non-diagnostic. Base everything ONLY on the provided recording.`;

const USER = `Analyse this RECORDING (video frames if any AND its soundtrack) for a used-car
mechanical check. Consider visible cues (smoke colour, warning lights, leaks, vibration)
AND audible cues (engine note, knocking, rattles, whistles, idle stability).
Return ONLY this JSON:
{
 "detected_issues": [{ "issue_type": "other", "location": string, "severity": "low|moderate|high|critical", "confidence": number, "explanation": string }],
 "suspicious_observations": string[],
 "summary": string,
 "confidence": number
}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function uploadViaFilesApi(bytes, mimeType, displayName) {
  const start = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?key=${KEY}`, {
    method: "POST",
    headers: {
      "X-Goog-Upload-Protocol": "resumable",
      "X-Goog-Upload-Command": "start",
      "X-Goog-Upload-Header-Content-Length": String(bytes.length),
      "X-Goog-Upload-Header-Content-Type": mimeType,
      "content-type": "application/json",
    },
    body: JSON.stringify({ file: { display_name: displayName } }),
  });
  if (!start.ok) throw new Error(`upload start ${start.status}: ${await start.text()}`);
  const uploadUrl = start.headers.get("x-goog-upload-url");
  if (!uploadUrl) throw new Error("no upload URL returned");

  const up = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Length": String(bytes.length), "X-Goog-Upload-Offset": "0", "X-Goog-Upload-Command": "upload, finalize" },
    body: bytes,
  });
  if (!up.ok) throw new Error(`upload ${up.status}: ${await up.text()}`);
  let f = (await up.json()).file;
  const deadline = Date.now() + 120000;
  while (f.state === "PROCESSING" && Date.now() < deadline) {
    await sleep(2000);
    const st = await fetch(`https://generativelanguage.googleapis.com/v1beta/${f.name}?key=${KEY}`);
    f = await st.json();
  }
  if (f.state !== "ACTIVE") throw new Error(`file not ACTIVE (state=${f.state})`);
  return f; // { name, uri, ... }
}

async function main() {
  const ext = extname(file).toLowerCase();
  const mimeType = MIME[ext];
  if (!mimeType) { console.error(`✗ Unsupported extension "${ext}". Use mp4/mov/webm/3gp or wav/mp3/m4a/aac/ogg/flac.`); process.exit(1); }

  const bytes = await readFile(file);
  console.log(`• File: ${basename(file)}  (${(bytes.length / 1024 / 1024).toFixed(1)} MB, ${mimeType})`);
  console.log(`• Model: ${MODEL}`);

  let mediaPart;
  let uploaded = null;
  if (bytes.length <= INLINE_LIMIT) {
    console.log("• Path: inline (≤18 MB)");
    mediaPart = { inline_data: { mime_type: mimeType, data: bytes.toString("base64") } };
  } else {
    console.log("• Path: Files API (resumable upload + processing)…");
    uploaded = await uploadViaFilesApi(bytes, mimeType, basename(file));
    console.log(`  uploaded → ${uploaded.uri}`);
    mediaPart = { file_data: { mime_type: mimeType, file_uri: uploaded.uri } };
  }

  const t0 = Date.now();
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: [{ role: "user", parts: [mediaPart, { text: USER }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
    }),
  });
  const raw = await res.text();
  console.log(`• Gemini HTTP ${res.status} in ${((Date.now() - t0) / 1000).toFixed(1)}s\n`);
  if (!res.ok) { console.error("✗ Error:\n" + raw); process.exit(1); }

  const data = JSON.parse(raw);
  const text = (data.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("");
  console.log("=== Gemini structured analysis ===");
  try { console.log(JSON.stringify(JSON.parse(text), null, 2)); }
  catch { console.log(text); }

  // best-effort cleanup
  if (uploaded) await fetch(`https://generativelanguage.googleapis.com/v1beta/${uploaded.name}?key=${KEY}`, { method: "DELETE" }).catch(() => {});
  console.log("\n✓ If the JSON above describes what's actually in your clip, Gemini is analysing the media correctly.");
}

main().catch((e) => { console.error("✗ " + (e?.message || e)); process.exit(1); });
