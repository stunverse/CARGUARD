-- =====================================================================
-- CarGuard AI — Paid per-VIN history (VinAudit / NMVTIS), pay-per-report.
--   * vin_reports: server-side cache of fetched provider data (locked;
--     read only via service role after entitlement is verified in code).
--   * vin_report_purchases: a user's paid entitlement to a VIN report.
-- =====================================================================

create table if not exists public.vin_reports (
  vin text primary key,
  provider text not null default 'vinaudit',
  data jsonb not null,
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
-- Locked table: enable RLS with no policies → only the service role reads.
alter table public.vin_reports enable row level security;

create table if not exists public.vin_report_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vin text not null,
  inspection_session_id uuid references public.inspection_sessions(id) on delete set null,
  provider text not null default 'vinaudit',
  stripe_checkout_session_id text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  amount_cents integer,
  currency text default 'usd',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_vin_purchases_user on public.vin_report_purchases(user_id);
create index if not exists idx_vin_purchases_vin on public.vin_report_purchases(vin);

create trigger trg_vin_purchases_updated
  before update on public.vin_report_purchases
  for each row execute function public.set_updated_at();

alter table public.vin_report_purchases enable row level security;
-- Owner can read their purchases and create pending ones; status changes
-- are done by the Stripe webhook via the service role.
create policy "vin_purchases_select_own" on public.vin_report_purchases
  for select using (user_id = auth.uid() or public.is_admin());
create policy "vin_purchases_insert_own" on public.vin_report_purchases
  for insert with check (user_id = auth.uid());
