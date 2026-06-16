-- =====================================================================
-- CarGuard AI — Inspection credits (packs of 1 / 2 / 3 inspections)
-- The buyer purchases a pack; each new inspection consumes one credit.
-- =====================================================================

alter table public.profiles
  add column if not exists inspection_credits integer not null default 0;

-- Atomic credit consumption (used by the inspection checkout). Returns the
-- remaining balance, or -1 when the user has no credit to spend.
create or replace function public.consume_inspection_credit(p_user uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining integer;
begin
  update public.profiles
    set inspection_credits = inspection_credits - 1
    where id = p_user and inspection_credits > 0
    returning inspection_credits into remaining;
  if not found then
    return -1;
  end if;
  return remaining;
end;
$$;

-- Grant credits after a successful pack purchase (called by the Stripe webhook).
create or replace function public.grant_inspection_credits(p_user uuid, p_amount integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
    set inspection_credits = inspection_credits + greatest(p_amount, 0)
    where id = p_user;
end;
$$;

-- Only the server (service role) may spend or grant credits — never the client.
revoke execute on function public.consume_inspection_credit(uuid) from public;
revoke execute on function public.consume_inspection_credit(uuid) from authenticated;
grant execute on function public.consume_inspection_credit(uuid) to service_role;
revoke execute on function public.grant_inspection_credits(uuid, integer) from public;
revoke execute on function public.grant_inspection_credits(uuid, integer) from authenticated;
grant execute on function public.grant_inspection_credits(uuid, integer) to service_role;
