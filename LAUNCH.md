# CarGuard AI — Launch checklist

Pre-launch gating is now enforced in code:
- **Payment**: when Stripe is configured, `/analyze` and `/report` refuse to run
  unless `inspection_sessions.payment_status = 'paid'` (402). In demo mode (no
  Stripe key) this is a no-op so local/dev keeps working.
- **AI**: when Stripe is configured but `OPENAI_API_KEY` is missing, paid
  analysis/report are refused (503) — we never sell a deterministic demo report.

---

## 1. Environment variables (production)

### Required (core)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — webhook + account deletion
- `OPENAI_API_KEY` — **required**, otherwise paid analysis is blocked
- `NEXT_PUBLIC_APP_URL` — e.g. `https://carguard.ai` (Stripe success/cancel URLs)

### Required for revenue (Stripe)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `INSPECTION_PRICE` (default 29) and `INSPECTION_CURRENCY` (default eur)

### Optional (paid data sources — branch when ready)
- `VINAUDIT_API_KEY`, `VIN_HISTORY_PRICE_CENTS`, `VIN_HISTORY_CURRENCY` (US NMVTIS)
- `DVLA_API_KEY` (UK plate, free)
- `PLATE_LOOKUP_PROVIDER` / `PLATE_LOOKUP_API_URL` / `PLATE_LOOKUP_API_KEY` (EU plate)
- `EU_HISTORY_PROVIDER` / `EU_HISTORY_API_URL` / `EU_HISTORY_API_KEY` (EU history)
- `EURONCAP_API_URL` / `EURONCAP_API_KEY` (EU safety)

### Quotas (optional with pay-per-inspection)
- `ENFORCE_QUOTAS=true` only if you keep subscription tiers. With pay-per-
  inspection the real gate is payment, so this can stay off.

---

## 2. Supabase

- [ ] Run **all** migrations in order (`supabase/migrations/0001 → 0009`) — or run
      `supabase/setup.sql` on a fresh project. **0008 (payment)** and **0009
      (documents)** are required by the current code.
- [ ] Confirm storage buckets exist & are **private**: `inspection-photos`,
      `engine-audio`, `mechanical-media`, `inspection-documents`.
- [ ] Auth → URL config: add the production domain to **Redirect URLs**
      (`/auth/callback`, password reset).
- [ ] Custom SMTP + verified sender domain for auth emails (deliverability).
- [ ] Create at least one admin (`profiles.is_admin = true`).

## 3. Stripe

- [ ] Live keys set (above).
- [ ] Register the webhook endpoint: `POST {APP_URL}/api/billing/webhook`,
      events: `checkout.session.completed` (+ subscription events if used).
- [ ] Put the signing secret in `STRIPE_WEBHOOK_SECRET`.
- [ ] End-to-end test: pay → draft becomes `paid` → analyze + report succeed.
- [ ] Test cancel → returns to the wizard with vehicle data preserved.

## 4. OpenAI

- [ ] `OPENAI_API_KEY` set; verify a real inspection produces a non-demo report.
- [ ] Watch cost per inspection (vision + audio) vs the €29 margin.

---

## 5. Legal / compliance (FR + EU) — do before public launch

- [ ] Real **Privacy Policy** (GDPR): processors (OpenAI, Supabase, Stripe),
      retention periods, user rights, contact/DPO.
- [ ] **Terms of Service (CGU)** and **Sales Terms (CGV)** — CGV are mandatory in
      FR for a paid service.
- [ ] **Right of withdrawal**: digital service started immediately → collect the
      explicit waiver of the 14-day withdrawal right at checkout; define refunds.
- [ ] Replace the **illustrative testimonials** on the landing with real ones, or
      label them as examples.
- [ ] Cookie notice (only essential cookies today; add a CNIL banner if you add
      analytics/marketing).

## 6. Privacy hardening

- [ ] Account deletion currently removes DB rows (cascade) but **not Storage
      files** — add bucket cleanup on account/inspection deletion.
- [ ] Review admin RLS (`is_admin()` grants read to all data incl. media URLs) —
      restrict per the "no access to user photos without reason" requirement.

---

## 7. Recommended (fast-follow)

- [ ] SEO: `robots.txt`, `sitemap.xml`, per-page metadata/OpenGraph, JSON-LD.
- [ ] PWA: add a service worker so the app is installable.
- [ ] Decide on subscription plans UI (hide if pure pay-per-inspection).
- [ ] Move rate-limiting to a shared store (Upstash/Redis) — current limiter is
      per-instance and resets on serverless cold start.
- [ ] Error monitoring (Sentry) + alerting.
- [ ] A smoke test for the happy path: pay → 8 photos → engine → documents →
      report.
