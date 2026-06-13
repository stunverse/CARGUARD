# CarGuard AI — Deploy to production (Vercel + Supabase)

Goal: a live HTTPS URL for the web app — the prerequisite for the mobile
builds (see [MOBILE.md](./MOBILE.md)). ~15 minutes.

Order matters: **Supabase first** (to get the keys), then **Vercel**, then a
final **redeploy**.

---

## 1. Supabase — database & storage

1. Create a project at [supabase.com](https://supabase.com) → **New project**
   (note the DB password). Wait until it is ready.
2. **SQL Editor → New query** → paste the entire contents of
   **`supabase/setup.sql`** → **Run**. This creates every table, RLS policy,
   the 8 seeded photo points, plan limits, and the two private storage buckets
   (`inspection-photos`, `engine-audio`).
   - Re-running it later may error on `CREATE POLICY` lines that already exist —
     that is safe to ignore.
3. **Settings → API** — copy these three values:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (secret) → `SUPABASE_SERVICE_ROLE_KEY`

---

## 2. Vercel — first deploy

1. **Add New… → Project** → import `stunverse/CARGUARD`, branch
   `claude/brave-newton-5jqoeu` (the screen you already reached).
2. Framework preset: **Next.js** (auto-detected). Root dir `./`. Don't change build settings.
3. Expand **Environment Variables** and add (Production + Preview):

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ…` |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJ…` (secret) |
   | `STORAGE_BUCKET_INSPECTION_PHOTOS` | `inspection-photos` |
   | `STORAGE_BUCKET_ENGINE_AUDIO` | `engine-audio` |
   | `NEXT_PUBLIC_APP_URL` | leave blank for now (set in step 4) |

   Optional now or later:
   - `OPENAI_API_KEY`, `OPENAI_VISION_MODEL=gpt-4o`, `OPENAI_AUDIO_MODEL=gpt-4o-audio-preview`
     (without these the AI runs in cautious **demo mode**).
   - Stripe keys (see README → Billing).
4. Click **Deploy**. When it finishes, copy the production URL,
   e.g. `https://carguard-xxxx.vercel.app`.

---

## 3. Supabase — auth URLs

**Authentication → URL Configuration**:
- **Site URL**: your Vercel URL.
- **Redirect URLs**: add `https://carguard-xxxx.vercel.app/auth/callback`.

For quick testing without email confirmation: **Authentication → Providers →
Email** → turn **Confirm email** off. (Re-enable for production.)

Google sign-in (optional): **Providers → Google** → enable and fill the OAuth
client; the callback is the same `/auth/callback`.

---

## 4. Vercel — set the app URL & redeploy

1. **Settings → Environment Variables** → set
   `NEXT_PUBLIC_APP_URL = https://carguard-xxxx.vercel.app`.
2. **Deployments → … → Redeploy** (so server-side redirects, share links and
   Stripe/OAuth callbacks use the right origin).

---

## 5. Smoke test

- Open the URL → landing renders.
- **Sign up** → you land on `/dashboard`.
- **New inspection** → fill the vehicle form → **Hidden Damage Scanner**.
- Upload a photo for each of the 8 angles → **Run AI analysis** →
  **Generate report** → **Export PDF**.
- Open the **Engine Audio** tab → upload an MP3/WAV → **Analyze**.

Make yourself admin (optional), in Supabase SQL Editor:

```sql
update profiles set is_admin = true where email = 'you@example.com';
```

---

## 6. (Optional) Stripe webhook

After deploy, point a Stripe webhook at
`https://carguard-xxxx.vercel.app/api/billing/webhook` for
`checkout.session.completed`, `customer.subscription.created|updated|deleted`,
`invoice.payment_failed`, then set the Stripe env vars and redeploy. Details in
the README.

---

## Next: mobile builds

Once the HTTPS URL is live, set `MOBILE_SERVER_URL` to it and follow
[MOBILE.md](./MOBILE.md) to generate and submit the iOS/Android apps.
