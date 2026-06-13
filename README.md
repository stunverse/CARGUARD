# CarGuard AI

**AI-powered hidden damage detection for used car buyers.**

> Take 8 guided exterior photos. CarGuard AI helps you detect signs of previous
> accidents, repainting, body repairs, or hidden damage before buying a used car.

CarGuard AI is **not** a replacement for a professional inspection. It is a
cautious, photo-based preliminary screening tool. It speaks in probabilities,
never certainties, and never accuses a seller.

---

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** with a custom shadcn-style UI kit (`src/components/ui`)
- **Supabase** — Postgres + Auth + Storage + Row Level Security
- **OpenAI** vision (`gpt-4o`) for photo quality checks and damage analysis
- **Stripe** Billing (scaffolded; optional)

The app runs end-to-end **without** OpenAI or Stripe keys: AI functions fall
back to cautious, deterministic placeholders ("demo mode") so the full flow is
demonstrable.

> **Deploy to production:** Vercel + Supabase, step by step in **[DEPLOY.md](./DEPLOY.md)**
> (paste `supabase/setup.sql` once to create the whole schema).
>
> **Mobile (App Store & Google Play):** CarGuard ships to the stores as a
> native app via Capacitor that wraps the deployed web app. See **[MOBILE.md](./MOBILE.md)**.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase (+ optional OpenAI / Stripe)
npm run dev
```

### Database

Apply the SQL migrations in `supabase/migrations` (in order) to your Supabase
project — via the SQL editor or the Supabase CLI (`supabase db push`):

1. `0001_init.sql` — all tables + triggers
2. `0002_rls.sql` — Row Level Security policies
3. `0003_seed.sql` — the **8 mandatory photo points** + plan usage limits
4. `0004_storage.sql` — private `inspection-photos` bucket + storage policies

Make a user an admin: `update profiles set is_admin = true where email = '…';`

## The Hidden Damage Scanner (core module)

8 mandatory **exterior** photos (no interior/engine in the main flow):

1. Front · 2. Rear · 3. Left side · 4. Right side
5. Front-left · 6. Front-right · 7. Rear-left · 8. Rear-right diagonals

Flow: create inspection → enter vehicle → take/upload 8 photos → AI quality
check per photo → AI analysis per photo → global analysis → scores +
recommendation + seller questions + negotiation arguments → final report
(preview, print-to-PDF, secure share link).

## Engine Start Audio Analysis (optional module)

A separate, optional check on the inspection detail page (**Engine Audio** tab):
record or upload a short audio/video of the engine starting; the AI listens for
suspicious startup noises (knocking, rattling, timing-chain, belt squeal, rough
idle, misfire, starter, exhaust/air leak, turbo whistle…). It produces an
`engine_audio_score`, sub-scores, detected sounds with severity, a cautious
recommendation, and seller/mechanic questions — appended to the final report
(section 10) and the PDF. An inspection can be completed **without** audio.

- Table: `engine_audio_checks` (migration `0005`); private bucket `engine-audio`.
- AI: `src/lib/ai/engine-audio.ts` (`checkEngineAudioQuality`, `analyzeEngineAudio`,
  `generateEngineAudioSummary`). Real analysis uses `OPENAI_AUDIO_MODEL`
  (`gpt-4o-audio-preview`) and accepts **MP3/WAV**; other formats are stored and
  handled in a limited/demo mode.
- Env: `STORAGE_BUCKET_ENGINE_AUDIO`, `OPENAI_AUDIO_MODEL`.

## AI functions (`src/lib/ai/functions.ts`)

`checkPhotoQuality` · `analyzeInspectionPhoto` · `analyzeFullInspection` ·
`calculateInspectionScores` · `generateSellerQuestions` ·
`generateNegotiationArguments` · `generateFinalReport` (`src/lib/report.ts`) ·
`generateFollowUpPhotoRequests`. Cautious rules live in `src/lib/ai/prompts.ts`.

## Scoring

Higher score = safer. `85–100` low · `65–84` moderate · `40–64` high ·
`0–39` very high risk → maps to buy / negotiate / professional_inspection /
avoid (`src/lib/constants.ts`).

## Project layout

```
src/app                 Routes (public, (app) authed group, api, admin)
src/components          UI kit + domain components
src/lib/ai              AI client, prompts, the 8 functions
src/lib                 supabase clients, constants, billing, report, activity
src/types               Domain + AI JSON contracts
supabase/migrations     Schema, RLS, seed, storage
```

## Billing (Stripe)

Fully wired when the Stripe env vars are set (otherwise the app degrades to a
read-only pricing preview):

1. Create 3 recurring products in Stripe (Starter, Plus, Pro) and copy their
   price IDs into `STRIPE_PRICE_STARTER` / `_PLUS` / `_PRO`.
2. Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. Point a webhook at `/api/billing/webhook` for: `checkout.session.completed`,
   `customer.subscription.created|updated|deleted`, `invoice.payment_failed`.

Flow: **Checkout** (`/api/billing/checkout`, subscription mode) →
**webhook** syncs `public.subscriptions` → **Customer Portal**
(`/api/billing/portal`) for upgrade/downgrade/cancel/payment method.
Monthly **quotas** (`src/lib/quota.ts`) are enforced on inspection creation
and report generation per `usage_limits`.

## Roadmap (scaffolded, not in MVP)

VIN/Carfax APIs, listing import, market price comparison, model knowledge base
enrichment, video/audio analysis, B2B marketplace. See `TODO` comments and the
`vehicle_model_knowledge` table.
