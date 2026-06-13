-- =====================================================================
-- CarGuard AI — FULL DATABASE SETUP (run once in Supabase SQL Editor)
-- Concatenation of supabase/migrations/0001..0005 in order.
-- Safe to re-run: objects use IF NOT EXISTS / ON CONFLICT where possible.
-- (Policies use CREATE POLICY: if you re-run, drop them first or ignore
--  'already exists' errors on the policy statements.)
-- =====================================================================


-- ###################################################################
-- # 0001_init.sql
-- ###################################################################

-- =====================================================================
-- CarGuard AI — Initial schema
-- AI-powered hidden damage detection for used car buyers.
--
-- Conventions:
--   * UUID primary keys (gen_random_uuid()).
--   * Every user-owned table carries user_id and is protected by RLS.
--   * Enums modelled as text + CHECK constraints for forward-compat
--     (easy to extend without ALTER TYPE migrations).
--   * updated_at maintained by trigger.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- profiles  (1:1 with auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text,
  phone text,
  country text,
  preferred_language text default 'en',
  is_admin boolean not null default false,
  terms_accepted_at timestamptz,
  disclaimer_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- user_consents  (terms / disclaimer audit trail)
-- ---------------------------------------------------------------------
create table if not exists public.user_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null check (consent_type in ('terms', 'disclaimer', 'privacy', 'report_disclaimer')),
  consent_text text not null,
  accepted_at timestamptz not null default now(),
  ip_address text,
  created_at timestamptz not null default now()
);
create index if not exists idx_user_consents_user on public.user_consents(user_id);

-- ---------------------------------------------------------------------
-- vehicles
-- ---------------------------------------------------------------------
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  make text not null,
  model text not null,
  year integer,
  generation text,
  trim text,
  engine text,
  fuel_type text,
  transmission text,
  mileage integer,
  asking_price numeric,
  currency text default 'USD',
  seller_type text check (seller_type in ('private', 'dealership', 'garage', 'marketplace', 'unknown')),
  listing_url text,
  vin text,
  country text,
  city text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_vehicles_user on public.vehicles(user_id);
create trigger trg_vehicles_updated
  before update on public.vehicles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- inspection_sessions
-- ---------------------------------------------------------------------
create table if not exists public.inspection_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  goal text, -- user objective (check_accident | detect_repaint | suspicious | negotiate | quick_report)
  status text not null default 'draft' check (status in (
    'draft', 'waiting_for_photos', 'photos_uploaded', 'quality_check_in_progress',
    'quality_check_failed', 'ready_for_analysis', 'analysis_in_progress',
    'analysis_completed', 'report_generated', 'archived'
  )),
  global_score integer check (global_score between 0 and 100),
  accident_repair_score integer check (accident_repair_score between 0 and 100),
  alignment_score integer check (alignment_score between 0 and 100),
  paint_tone_score integer check (paint_tone_score between 0 and 100),
  symmetry_score integer check (symmetry_score between 0 and 100),
  bumpers_lights_score integer check (bumpers_lights_score between 0 and 100),
  overall_consistency_score integer check (overall_consistency_score between 0 and 100),
  model_risk_score integer check (model_risk_score between 0 and 100),
  recommendation text check (recommendation in ('buy', 'negotiate', 'professional_inspection', 'avoid', 'insufficient_photos')),
  risk_level text check (risk_level in ('low', 'moderate', 'high', 'very_high')),
  ai_summary text,
  final_report jsonb,
  report_pdf_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_sessions_user on public.inspection_sessions(user_id);
create index if not exists idx_sessions_status on public.inspection_sessions(status);
create trigger trg_sessions_updated
  before update on public.inspection_sessions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- inspection_photo_points  (reference data — the 8 required angles)
-- ---------------------------------------------------------------------
create table if not exists public.inspection_photo_points (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text,
  required boolean not null default true,
  order_index integer not null,
  category text,
  instruction text,
  why_it_matters text,
  expected_angle text,
  example_image_url text,
  ai_detection_targets jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_photo_points_updated
  before update on public.inspection_photo_points
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- inspection_photos
-- ---------------------------------------------------------------------
create table if not exists public.inspection_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  inspection_session_id uuid not null references public.inspection_sessions(id) on delete cascade,
  photo_point_id uuid references public.inspection_photo_points(id) on delete set null,
  photo_point_code text, -- denormalized for convenience
  image_url text,
  storage_path text,
  original_file_name text,
  mime_type text,
  file_size bigint,
  upload_status text not null default 'pending' check (upload_status in ('pending', 'uploaded', 'failed')),
  quality_status text not null default 'pending' check (quality_status in ('pending', 'passed', 'failed', 'needs_retake', 'skipped')),
  quality_feedback text,
  analysis_status text not null default 'pending' check (analysis_status in ('pending', 'analyzing', 'completed', 'failed')),
  ai_quality_check jsonb,
  ai_analysis jsonb,
  detected_issues jsonb,
  severity text check (severity in ('none', 'low', 'moderate', 'high', 'critical')),
  confidence integer check (confidence between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_photos_session on public.inspection_photos(inspection_session_id);
create index if not exists idx_photos_user on public.inspection_photos(user_id);
create trigger trg_photos_updated
  before update on public.inspection_photos
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- follow_up_photo_requests  (optional, AI-triggered close-ups)
-- ---------------------------------------------------------------------
create table if not exists public.follow_up_photo_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  inspection_session_id uuid not null references public.inspection_sessions(id) on delete cascade,
  triggered_by_photo_id uuid references public.inspection_photos(id) on delete set null,
  title text not null,
  instruction text,
  reason text,
  target_area text,
  status text not null default 'requested' check (status in ('requested', 'uploaded', 'skipped', 'analyzed')),
  image_url text,
  storage_path text,
  ai_analysis jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_followup_session on public.follow_up_photo_requests(inspection_session_id);
create trigger trg_followup_updated
  before update on public.follow_up_photo_requests
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- inspection_reports
-- ---------------------------------------------------------------------
create table if not exists public.inspection_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  inspection_session_id uuid not null references public.inspection_sessions(id) on delete cascade,
  report_content jsonb not null,
  pdf_url text,
  share_token text unique,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_reports_session on public.inspection_reports(inspection_session_id);
create index if not exists idx_reports_share on public.inspection_reports(share_token);
create trigger trg_reports_updated
  before update on public.inspection_reports
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- activity_logs
-- ---------------------------------------------------------------------
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  inspection_session_id uuid references public.inspection_sessions(id) on delete cascade,
  action_type text not null,
  action_description text,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_activity_session on public.activity_logs(inspection_session_id);
create index if not exists idx_activity_user on public.activity_logs(user_id);

-- ---------------------------------------------------------------------
-- vehicle_model_knowledge  (reference data — empty at first)
-- ---------------------------------------------------------------------
create table if not exists public.vehicle_model_knowledge (
  id uuid primary key default gen_random_uuid(),
  make text not null,
  model text not null,
  year_start integer,
  year_end integer,
  generation text,
  body_type text,
  known_body_issues jsonb,
  known_alignment_issues jsonb,
  common_repair_zones jsonb,
  common_repaint_zones jsonb,
  structural_risk_notes text,
  recall_notes text,
  average_repair_costs jsonb,
  source_url text,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_model_knowledge_make_model on public.vehicle_model_knowledge(make, model);
create trigger trg_model_knowledge_updated
  before update on public.vehicle_model_knowledge
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- admin_access_logs
-- ---------------------------------------------------------------------
create table if not exists public.admin_access_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  target_user_id uuid references auth.users(id) on delete set null,
  inspection_session_id uuid references public.inspection_sessions(id) on delete set null,
  action text not null,
  reason text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Billing: subscriptions / usage_events / usage_limits
-- ---------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan_name text not null default 'free' check (plan_name in ('free', 'starter', 'plus', 'pro')),
  status text not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists idx_subscriptions_user on public.subscriptions(user_id);
create trigger trg_subscriptions_updated
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  inspection_session_id uuid references public.inspection_sessions(id) on delete set null,
  quantity integer not null default 1,
  created_at timestamptz not null default now()
);
create index if not exists idx_usage_events_user on public.usage_events(user_id);

create table if not exists public.usage_limits (
  id uuid primary key default gen_random_uuid(),
  plan_name text not null unique,
  inspections_per_month integer,
  reports_per_month integer,
  photo_analysis_limit integer,
  follow_up_photos_limit integer,
  pdf_exports_limit integer,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- support_tickets
-- ---------------------------------------------------------------------
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'waiting_for_user', 'resolved', 'closed')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_tickets_user on public.support_tickets(user_id);
create trigger trg_tickets_updated
  before update on public.support_tickets
  for each row execute function public.set_updated_at();

-- ###################################################################
-- # 0002_rls.sql
-- ###################################################################

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

-- ###################################################################
-- # 0003_seed.sql
-- ###################################################################

-- =====================================================================
-- CarGuard AI — Seed data
--   * The 8 mandatory exterior photo points (Hidden Damage Scanner).
--   * Default plan usage limits.
-- =====================================================================

insert into public.inspection_photo_points
  (code, title, description, required, order_index, category, instruction, why_it_matters, expected_angle, ai_detection_targets)
values
  (
    'front_view', 'Front view',
    'Complete front of the vehicle.', true, 1, 'exterior',
    'Stand directly in front of the vehicle. Take a clear photo showing the entire front of the car, including the hood, headlights, grille, bumper, and both front corners.',
    'Analyzes hood/headlight/bumper alignment, grille replacement, color differences across front panels, visible front impact, and front symmetry.',
    'front',
    '["hood_alignment","headlight_alignment","front_bumper_alignment","grille_alignment","front_symmetry","color_difference_front_panels","visible_damage_front","possible_previous_front_repair"]'::jsonb
  ),
  (
    'rear_view', 'Rear view',
    'Complete rear of the vehicle.', true, 2, 'exterior',
    'Stand directly behind the vehicle. Take a clear photo showing the entire rear of the car, including the trunk, rear lights, bumper, and both rear corners.',
    'Analyzes trunk/tail-light/bumper alignment, color differences, replaced bumper, possible rear impact, and rear symmetry.',
    'rear',
    '["trunk_alignment","rear_light_alignment","rear_bumper_alignment","rear_symmetry","color_difference_rear_panels","visible_damage_rear","possible_previous_rear_repair"]'::jsonb
  ),
  (
    'left_side_view', 'Left side view',
    'Complete left side, front to rear bumper.', true, 3, 'exterior',
    'Stand on the left side of the vehicle. Take a clear photo showing the entire side from front bumper to rear bumper.',
    'Analyzes fender/door/quarter-panel alignment, rocker panel, side color consistency, lateral impact, and replaced/repainted panels.',
    'left_side',
    '["left_front_fender_alignment","left_front_door_alignment","left_rear_door_alignment","left_rear_quarter_alignment","left_rocker_panel_condition","left_side_color_consistency","left_side_visible_damage","possible_left_side_repair"]'::jsonb
  ),
  (
    'right_side_view', 'Right side view',
    'Complete right side, front to rear bumper.', true, 4, 'exterior',
    'Stand on the right side of the vehicle. Take a clear photo showing the entire side from front bumper to rear bumper.',
    'Analyzes fender/door/quarter-panel alignment, rocker panel, side color consistency, lateral impact, and replaced/repainted panels.',
    'right_side',
    '["right_front_fender_alignment","right_front_door_alignment","right_rear_door_alignment","right_rear_quarter_alignment","right_rocker_panel_condition","right_side_color_consistency","right_side_visible_damage","possible_right_side_repair"]'::jsonb
  ),
  (
    'front_left_diagonal', 'Front-left diagonal view',
    'Three-quarter front-left angle.', true, 5, 'exterior',
    'Stand at the front-left corner of the vehicle. Take a photo showing both the front and the left side of the car.',
    'Analyzes consistency between front and left side, hood-to-fender gap, bumper-to-fender alignment, left headlight, reflections/tone, and front-left impact.',
    'front_left',
    '["front_left_corner_alignment","hood_to_left_fender_gap","bumper_to_left_fender_alignment","left_headlight_position","left_front_panel_color_consistency","front_left_visible_damage","possible_front_left_repair"]'::jsonb
  ),
  (
    'front_right_diagonal', 'Front-right diagonal view',
    'Three-quarter front-right angle.', true, 6, 'exterior',
    'Stand at the front-right corner of the vehicle. Take a photo showing both the front and the right side of the car.',
    'Analyzes consistency between front and right side, hood-to-fender gap, bumper-to-fender alignment, right headlight, reflections/tone, and front-right impact.',
    'front_right',
    '["front_right_corner_alignment","hood_to_right_fender_gap","bumper_to_right_fender_alignment","right_headlight_position","right_front_panel_color_consistency","front_right_visible_damage","possible_front_right_repair"]'::jsonb
  ),
  (
    'rear_left_diagonal', 'Rear-left diagonal view',
    'Three-quarter rear-left angle.', true, 7, 'exterior',
    'Stand at the rear-left corner of the vehicle. Take a photo showing both the rear and the left side of the car.',
    'Analyzes consistency between rear and left side, trunk-to-quarter gap, bumper-to-quarter alignment, left tail light, reflections/tone, and rear-left impact.',
    'rear_left',
    '["rear_left_corner_alignment","trunk_to_left_quarter_gap","rear_bumper_to_left_quarter_alignment","left_tail_light_position","left_rear_panel_color_consistency","rear_left_visible_damage","possible_rear_left_repair"]'::jsonb
  ),
  (
    'rear_right_diagonal', 'Rear-right diagonal view',
    'Three-quarter rear-right angle.', true, 8, 'exterior',
    'Stand at the rear-right corner of the vehicle. Take a photo showing both the rear and the right side of the car.',
    'Analyzes consistency between rear and right side, trunk-to-quarter gap, bumper-to-quarter alignment, right tail light, reflections/tone, and rear-right impact.',
    'rear_right',
    '["rear_right_corner_alignment","trunk_to_right_quarter_gap","rear_bumper_to_right_quarter_alignment","right_tail_light_position","right_rear_panel_color_consistency","rear_right_visible_damage","possible_rear_right_repair"]'::jsonb
  )
on conflict (code) do nothing;

-- Default plan usage limits.
insert into public.usage_limits
  (plan_name, inspections_per_month, reports_per_month, photo_analysis_limit, follow_up_photos_limit, pdf_exports_limit)
values
  ('free',    1,    0,   8,   0,   0),
  ('starter', 3,    3,   40,  10,  3),
  ('plus',    10,   10,  150, 50,  10),
  ('pro',     1000, 1000, 5000, 1000, 1000)
on conflict (plan_name) do nothing;

-- ###################################################################
-- # 0004_storage.sql
-- ###################################################################

-- =====================================================================
-- CarGuard AI — Storage bucket for inspection photos (private).
-- Access is via signed URLs only. Path convention:
--   {user_id}/{session_id}/{photo_point_code}.{ext}
-- RLS on storage.objects enforces per-user ownership by the first
-- path segment.
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('inspection-photos', 'inspection-photos', false)
on conflict (id) do nothing;

-- Users can read/write only objects under their own user-id prefix.
create policy "inspection_photos_select_own"
  on storage.objects for select
  using (
    bucket_id = 'inspection-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "inspection_photos_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'inspection-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "inspection_photos_update_own"
  on storage.objects for update
  using (
    bucket_id = 'inspection-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "inspection_photos_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'inspection-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ###################################################################
-- # 0005_engine_audio.sql
-- ###################################################################

-- =====================================================================
-- CarGuard AI — Engine Start Audio Analysis (optional module)
-- A separate, optional check attached to an inspection: the buyer records
-- or uploads a short audio/video of the engine starting; the AI listens
-- for suspicious startup noises. Does NOT alter the Hidden Damage Scanner.
-- =====================================================================

create table if not exists public.engine_audio_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  inspection_session_id uuid not null references public.inspection_sessions(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  file_url text,
  storage_path text,
  original_file_name text,
  file_type text,                 -- 'audio' | 'video'
  mime_type text,
  file_size bigint,
  duration_seconds integer,
  upload_status text not null default 'pending' check (upload_status in ('pending', 'uploaded', 'failed')),
  quality_status text not null default 'pending' check (quality_status in ('pending', 'passed', 'failed', 'needs_retake')),
  analysis_status text not null default 'pending' check (analysis_status in ('pending', 'analyzing', 'completed', 'failed')),
  audio_quality_score integer check (audio_quality_score between 0 and 100),
  engine_audio_score integer check (engine_audio_score between 0 and 100),
  startup_quality_score integer check (startup_quality_score between 0 and 100),
  idle_stability_score integer check (idle_stability_score between 0 and 100),
  mechanical_noise_score integer check (mechanical_noise_score between 0 and 100),
  belt_chain_noise_score integer check (belt_chain_noise_score between 0 and 100),
  exhaust_noise_score integer check (exhaust_noise_score between 0 and 100),
  confidence_score integer check (confidence_score between 0 and 100),
  risk_level text check (risk_level in ('low', 'moderate', 'high', 'very_high', 'insufficient_audio')),
  recommendation text check (recommendation in (
    'normal_sound', 'monitor', 'ask_seller_questions',
    'professional_inspection', 'avoid_without_diagnosis', 'insufficient_audio'
  )),
  ai_quality_check jsonb,
  ai_analysis jsonb,
  detected_sounds jsonb,
  seller_questions jsonb,
  mechanic_questions jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_engine_audio_session on public.engine_audio_checks(inspection_session_id);
create index if not exists idx_engine_audio_user on public.engine_audio_checks(user_id);

create trigger trg_engine_audio_updated
  before update on public.engine_audio_checks
  for each row execute function public.set_updated_at();

-- RLS: owner-only (admins may read via is_admin()).
alter table public.engine_audio_checks enable row level security;
create policy "engine_audio_owner" on public.engine_audio_checks
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- Private storage bucket for engine audio/video, per-user RLS.
-- Path convention: {user_id}/{session_id}/{check_id}.{ext}
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('engine-audio', 'engine-audio', false)
on conflict (id) do nothing;

create policy "engine_audio_select_own"
  on storage.objects for select
  using (
    bucket_id = 'engine-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "engine_audio_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'engine-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "engine_audio_update_own"
  on storage.objects for update
  using (
    bucket_id = 'engine-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "engine_audio_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'engine-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ###################################################################
-- # 0006_mechanical.sql
-- ###################################################################

-- =====================================================================
-- CarGuard AI — Engine & Mechanical Check (unified optional module)
-- Extends the engine check into a full guided mechanical inspection
-- (points 2-15). Reuses the cautious, optional pattern of the audio
-- module. Does not alter the Hidden Damage Scanner.
-- =====================================================================

-- Unified engine/mechanical scoring on the session.
alter table public.inspection_sessions
  add column if not exists mechanical_score integer
    check (mechanical_score between 0 and 100);
alter table public.inspection_sessions
  add column if not exists mechanical_risk_level text
    check (mechanical_risk_level in ('low', 'moderate', 'high', 'very_high', 'insufficient_data'));
alter table public.inspection_sessions
  add column if not exists mechanical_recommendation text
    check (mechanical_recommendation in (
      'normal', 'monitor', 'ask_seller_questions',
      'professional_inspection', 'avoid_without_diagnosis', 'insufficient_data'
    ));

-- One row per (session, mechanical point).
create table if not exists public.mechanical_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  inspection_session_id uuid not null references public.inspection_sessions(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  point_code text not null,
  media_type text,                 -- photo | photo_pair | video | questionnaire | docs
  image_url text,
  image_url_2 text,                -- second photo (e.g. dashboard engine running)
  video_url text,
  storage_path text,
  storage_path_2 text,
  video_storage_path text,
  doc_urls jsonb,                  -- maintenance records
  mime_type text,
  file_size bigint,
  duration_seconds integer,
  observations jsonb,              -- guided checkboxes the buyer ticked
  questionnaire_answers jsonb,
  upload_status text not null default 'pending' check (upload_status in ('pending', 'uploaded', 'failed')),
  quality_status text not null default 'pending' check (quality_status in ('pending', 'passed', 'failed', 'needs_retake', 'skipped')),
  analysis_status text not null default 'pending' check (analysis_status in ('pending', 'analyzing', 'completed', 'failed')),
  score integer check (score between 0 and 100),
  severity text check (severity in ('none', 'low', 'moderate', 'high', 'critical')),
  confidence integer check (confidence between 0 and 100),
  ai_analysis jsonb,
  detected_issues jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (inspection_session_id, point_code)
);
create index if not exists idx_mechanical_session on public.mechanical_checks(inspection_session_id);
create index if not exists idx_mechanical_user on public.mechanical_checks(user_id);

create trigger trg_mechanical_updated
  before update on public.mechanical_checks
  for each row execute function public.set_updated_at();

alter table public.mechanical_checks enable row level security;
create policy "mechanical_owner" on public.mechanical_checks
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

-- Private storage bucket for mechanical photos/videos/docs.
insert into storage.buckets (id, name, public)
values ('mechanical-media', 'mechanical-media', false)
on conflict (id) do nothing;

create policy "mechanical_media_select_own"
  on storage.objects for select
  using (bucket_id = 'mechanical-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "mechanical_media_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'mechanical-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "mechanical_media_update_own"
  on storage.objects for update
  using (bucket_id = 'mechanical-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "mechanical_media_delete_own"
  on storage.objects for delete
  using (bucket_id = 'mechanical-media' and (storage.foldername(name))[1] = auth.uid()::text);

-- ###################################################################
-- # 0007_vin_history.sql
-- ###################################################################

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
