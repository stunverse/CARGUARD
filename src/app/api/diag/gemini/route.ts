import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MEDIA_MODEL } from "@/lib/ai/client";

export const runtime = "nodejs";

// GET /api/diag/gemini — admin-only health check that calls Gemini FROM
// PRODUCTION (Vercel) with a tiny text prompt, so the exact runtime error
// (auth/model/region) is visible without running a paid inspection.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) {
    return NextResponse.json({
      configured: false,
      model: MEDIA_MODEL,
      hint: "Neither GEMINI_API_KEY nor GOOGLE_API_KEY is set in this environment.",
    });
  }

  // A non-usable hint so you can confirm WHICH key prod is actually using,
  // without exposing the secret.
  const keyHint = `${key.slice(0, 6)}… (len ${key.length})`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MEDIA_MODEL}:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Reply with the single word OK." }] }],
        generationConfig: { temperature: 0 },
      }),
    });
    const body = await res.text();
    return NextResponse.json({
      configured: true,
      model: MEDIA_MODEL,
      keyHint,
      httpStatus: res.status,
      ok: res.ok,
      response: body.slice(0, 800),
    });
  } catch (e) {
    return NextResponse.json({
      configured: true,
      model: MEDIA_MODEL,
      keyHint,
      error: e instanceof Error ? e.message : String(e),
    });
  }
}
