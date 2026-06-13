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
