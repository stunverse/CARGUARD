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
