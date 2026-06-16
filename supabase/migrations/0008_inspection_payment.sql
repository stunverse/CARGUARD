-- =====================================================================
-- CarGuard AI — Pay-per-inspection (€29)
-- The buyer pays once per inspection, right after the vehicle questions
-- and before the 8 photos. The draft inspection is created at payment time.
-- =====================================================================

alter table public.inspection_sessions
  add column if not exists payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid', 'refunded')),
  add column if not exists payment_amount_cents integer,
  add column if not exists payment_currency text,
  add column if not exists stripe_checkout_session_id text;

create index if not exists idx_sessions_payment_status
  on public.inspection_sessions(payment_status);
