-- =====================================================================
-- CarGuard AI — Row Level Security
-- Every user-owned table: a user can only see / mutate their own rows.
-- Reference tables (photo points, model knowledge, usage limits) are
-- world-readable but only writable by the service role / admins.
-- =====================================================================

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Enable RLS everywhere.
alter table public.profiles                enable row level security;
alter table public.user_consents           enable row level security;
alter table public.vehicles                enable row level security;
alter table public.inspection_sessions     enable row level security;
alter table public.inspection_photo_points enable row level security;
alter table public.inspection_photos       enable row level security;
alter table public.follow_up_photo_requests enable row level security;
alter table public.inspection_reports      enable row level security;
alter table public.activity_logs           enable row level security;
alter table public.vehicle_model_knowledge enable row level security;
alter table public.admin_access_logs       enable row level security;
alter table public.subscriptions           enable row level security;
alter table public.usage_events            enable row level security;
alter table public.usage_limits            enable row level security;
alter table public.support_tickets         enable row level security;

-- ---- profiles -------------------------------------------------------
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());

-- ---- generic owner policy template ----------------------------------
-- user_consents
create policy "consents_owner" on public.user_consents
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- vehicles
create policy "vehicles_owner" on public.vehicles
  for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid());

-- inspection_sessions
create policy "sessions_owner" on public.inspection_sessions
  for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid());

-- inspection_photos
create policy "photos_owner" on public.inspection_photos
  for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid());

-- follow_up_photo_requests
create policy "followup_owner" on public.follow_up_photo_requests
  for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid());

-- inspection_reports: owner full access; public read when shared.
create policy "reports_owner" on public.inspection_reports
  for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid());
create policy "reports_public_read" on public.inspection_reports
  for select using (is_public = true);

-- activity_logs: owner read; insert own.
create policy "activity_select_own" on public.activity_logs
  for select using (user_id = auth.uid() or public.is_admin());
create policy "activity_insert_own" on public.activity_logs
  for insert with check (user_id = auth.uid());

-- subscriptions
create policy "subscriptions_owner" on public.subscriptions
  for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid());

-- usage_events
create policy "usage_events_owner" on public.usage_events
  for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid());

-- support_tickets
create policy "tickets_owner" on public.support_tickets
  for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid());

-- ---- reference / read-only tables -----------------------------------
-- Photo points: everyone authenticated can read; only admins write.
create policy "photo_points_read" on public.inspection_photo_points
  for select using (true);
create policy "photo_points_admin_write" on public.inspection_photo_points
  for all using (public.is_admin()) with check (public.is_admin());

-- Vehicle model knowledge: world-readable, admin-writable.
create policy "model_knowledge_read" on public.vehicle_model_knowledge
  for select using (true);
create policy "model_knowledge_admin_write" on public.vehicle_model_knowledge
  for all using (public.is_admin()) with check (public.is_admin());

-- Usage limits: world-readable, admin-writable.
create policy "usage_limits_read" on public.usage_limits
  for select using (true);
create policy "usage_limits_admin_write" on public.usage_limits
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- admin-only -----------------------------------------------------
create policy "admin_logs_admin_only" on public.admin_access_logs
  for all using (public.is_admin()) with check (public.is_admin());
