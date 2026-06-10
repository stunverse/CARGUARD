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
