// =====================================================================
// CarGuard AI — Engine Start Audio Analysis (AI functions)
//
// Optional module. Real analysis uses an audio-capable model and only
// accepts WAV/MP3 payloads; for other formats or when OpenAI is not
// configured, a cautious, deterministic DEMO result is returned so the
// flow stays usable. SERVER ONLY.
// =====================================================================

import { isAIConfigured, runStructuredAudio } from "./client";
import {
  DEFAULT_MECHANIC_QUESTIONS,
  DEFAULT_SELLER_AUDIO_QUESTIONS,
  ENGINE_AUDIO_DISCLAIMER,
  engineAudioRiskToRecommendation,
  engineAudioScoreToRisk,
} from "@/lib/constants";
import type {
  EngineAudioAnalysis,
  EngineAudioQualityCheck,
} from "@/types";

const AUDIO_RULES = `You are CarGuard AI, a cautious assistant that listens to a short recording of
a car ENGINE STARTING and IDLING to flag POSSIBLE suspicious noises for a used-car buyer.

ALWAYS:
- Be prudent. Use "possible", "may suggest", "could be compatible with".
- State that the analysis depends entirely on the audio quality.
- Recommend a professional mechanic whenever there is any doubt.
- Base every statement ONLY on the provided audio.
- Give a confidence level (0-100).

NEVER:
- Say "the engine is definitely broken" or "this car is safe to buy".
- Diagnose a specific failure with certainty (e.g. "the timing chain is failing").
- Tell the user they can buy without inspection.
- Guarantee the engine condition.

Output STRICT JSON only, matching the requested schema.`;

// Map a known container mime/extension to a model-accepted format.
export function audioModelFormat(
  mime: string | null,
  ext: string | null,
): "wav" | "mp3" | null {
  const m = (mime ?? "").toLowerCase();
  const e = (ext ?? "").toLowerCase();
  if (m.includes("wav") || e === "wav") return "wav";
  if (m.includes("mpeg") || m.includes("mp3") || e === "mp3") return "mp3";
  return null; // m4a/aac/ogg/webm/video → not directly supported.
}

// ---------------------------------------------------------------------
// checkEngineAudioQuality()
// ---------------------------------------------------------------------
export async function checkEngineAudioQuality(params: {
  audioBase64: string | null;
  format: "wav" | "mp3" | null;
  durationSeconds: number;
}): Promise<EngineAudioQualityCheck> {
  const { audioBase64, format, durationSeconds } = params;

  const tooShort = durationSeconds > 0 && durationSeconds < 8;

  // Demo / unsupported-format fallback.
  if (!isAIConfigured() || !audioBase64 || !format) {
    return {
      is_usable: !tooShort,
      audio_quality_score: tooShort ? 35 : 70,
      duration_seconds: durationSeconds,
      engine_start_detected: true,
      engine_idle_detected: true,
      background_noise_level: "low",
      volume_level: "good",
      issues: tooShort
        ? [{ type: "too_short", explanation: "Recording is shorter than 8 seconds." }]
        : [],
      retake_required: tooShort,
      retake_instructions: tooShort
        ? "Record at least 10–20 seconds capturing the engine from startup."
        : "",
      confidence: 40,
    };
  }

  try {
    return await runStructuredAudio<EngineAudioQualityCheck>({
      system: `${AUDIO_RULES}

TASK: Quality-control this engine-start recording before analysis. Check for: too short,
too noisy, saturated/clipping, engine not detected, startup not detected, too much voice,
wind noise, volume too low. Return JSON exactly:
{
 "is_usable": boolean,
 "audio_quality_score": number,
 "duration_seconds": number,
 "engine_start_detected": boolean,
 "engine_idle_detected": boolean,
 "background_noise_level": "low|moderate|high",
 "volume_level": "too_low|good|too_high|saturated",
 "issues": [{ "type": "too_short|too_noisy|saturated|engine_not_detected|startup_not_detected|too_much_voice|wind_noise|unknown", "explanation": string }],
 "retake_required": boolean,
 "retake_instructions": string,
 "confidence": number
}`,
      userText: `Approximate duration: ${durationSeconds}s. Quality-check this engine-start audio.`,
      audioBase64,
      format,
    });
  } catch (err) {
    console.error("checkEngineAudioQuality failed, falling back:", err);
    return {
      is_usable: true,
      audio_quality_score: 60,
      duration_seconds: durationSeconds,
      engine_start_detected: true,
      engine_idle_detected: true,
      background_noise_level: "moderate",
      volume_level: "good",
      issues: [{ type: "unknown", explanation: "Automated quality check unavailable." }],
      retake_required: false,
      retake_instructions: "",
      confidence: 20,
    };
  }
}

// ---------------------------------------------------------------------
// analyzeEngineAudio()
// ---------------------------------------------------------------------
export async function analyzeEngineAudio(params: {
  audioBase64: string | null;
  format: "wav" | "mp3" | null;
  durationSeconds: number;
}): Promise<EngineAudioAnalysis> {
  const { audioBase64, format } = params;

  if (!isAIConfigured() || !audioBase64 || !format) {
    // Cautious neutral placeholder (demo mode or unsupported format).
    const score = 80;
    const risk = engineAudioScoreToRisk(score);
    return generateEngineAudioSummary({
      summary:
        "[Demo mode] No audio-model analysis was performed (OpenAI audio not configured or unsupported format). This is a neutral placeholder, not a real engine-sound analysis. A professional mechanic should confirm the engine condition.",
      engine_audio_score: score,
      startup_quality_score: score,
      idle_stability_score: score,
      mechanical_noise_score: score,
      belt_chain_noise_score: score,
      exhaust_noise_score: score,
      risk_level: risk,
      recommendation: engineAudioRiskToRecommendation(risk),
      detected_sounds: [],
      positive_observations: [
        "No suspicious startup noise was flagged in this placeholder result.",
      ],
      suspicious_observations: [],
      seller_questions: [],
      mechanic_questions: [],
      next_steps: [],
      disclaimer: ENGINE_AUDIO_DISCLAIMER,
      confidence_score: 35,
    });
  }

  try {
    const result = await runStructuredAudio<EngineAudioAnalysis>({
      system: `${AUDIO_RULES}

TASK: Analyze the engine-start audio for suspicious sounds: hard_start, knocking,
metallic_rattling, timing_chain_rattle, belt_squeal, rough_idle, misfire_like_sound,
starter_issue, exhaust_leak_suspicion, air_leak_suspicion, turbo_whistle_abnormal,
normal_startup, other.

All scores are 0-100 where HIGHER = SAFER (fewer concerns).
risk_level: low (85-100), moderate (65-84), high (40-64), very_high (0-39), or insufficient_audio.
recommendation: normal_sound | monitor | ask_seller_questions | professional_inspection | avoid_without_diagnosis | insufficient_audio.

Return JSON exactly:
{
 "summary": string,
 "engine_audio_score": number,
 "startup_quality_score": number,
 "idle_stability_score": number,
 "mechanical_noise_score": number,
 "belt_chain_noise_score": number,
 "exhaust_noise_score": number,
 "risk_level": string,
 "recommendation": string,
 "detected_sounds": [{ "sound_type": string, "severity": "low|moderate|high|critical", "confidence": number, "timestamp_start": number, "timestamp_end": number, "explanation": string, "possible_causes": string[], "recommended_action": string }],
 "positive_observations": string[],
 "suspicious_observations": string[],
 "seller_questions": string[],
 "mechanic_questions": string[],
 "next_steps": string[],
 "disclaimer": string,
 "confidence_score": number
}`,
      userText:
        "Analyze this engine-start recording and return the JSON schema. Be cautious and non-diagnostic.",
      audioBase64,
      format,
      temperature: 0.3,
    });
    return generateEngineAudioSummary(result);
  } catch (err) {
    console.error("analyzeEngineAudio failed, falling back:", err);
    const score = 70;
    const risk = engineAudioScoreToRisk(score);
    return generateEngineAudioSummary({
      summary:
        "Automated engine-audio analysis was unavailable. A professional mechanic inspection is recommended.",
      engine_audio_score: score,
      startup_quality_score: score,
      idle_stability_score: score,
      mechanical_noise_score: score,
      belt_chain_noise_score: score,
      exhaust_noise_score: score,
      risk_level: risk,
      recommendation: "professional_inspection",
      detected_sounds: [],
      positive_observations: [],
      suspicious_observations: [],
      seller_questions: [],
      mechanic_questions: [],
      next_steps: [],
      disclaimer: ENGINE_AUDIO_DISCLAIMER,
      confidence_score: 20,
    });
  }
}

// ---------------------------------------------------------------------
// generateEngineAudioSummary() — ensures questions/disclaimer are present.
// ---------------------------------------------------------------------
export function generateEngineAudioSummary(
  analysis: EngineAudioAnalysis,
): EngineAudioAnalysis {
  return {
    ...analysis,
    seller_questions: analysis.seller_questions?.length
      ? analysis.seller_questions
      : DEFAULT_SELLER_AUDIO_QUESTIONS,
    mechanic_questions: analysis.mechanic_questions?.length
      ? analysis.mechanic_questions
      : DEFAULT_MECHANIC_QUESTIONS,
    next_steps: analysis.next_steps?.length
      ? analysis.next_steps
      : [
          "Ask the seller for maintenance records.",
          "Consider a professional mechanic inspection before purchase.",
        ],
    disclaimer: analysis.disclaimer || ENGINE_AUDIO_DISCLAIMER,
  };
}
