-- =====================================================================
-- CarGuard AI — Inspection documents (maintenance, registration, non-pledge…)
-- Captured before the report. Their presence raises the report's confidence
-- (a documented car is more verifiable) and feeds a documents section.
-- =====================================================================

create table if not exists public.inspection_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  inspection_session_id uuid not null references public.inspection_sessions(id) on delete cascade,
  doc_type text not null,
  image_url text,
  storage_path text,
  mime_type text,
  file_size bigint,
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (inspection_session_id, doc_type)
);
create index if not exists idx_documents_session on public.inspection_documents(inspection_session_id);
create index if not exists idx_documents_user on public.inspection_documents(user_id);

create trigger trg_documents_updated
  before update on public.inspection_documents
  for each row execute function public.set_updated_at();

alter table public.inspection_documents enable row level security;
create policy "documents_owner" on public.inspection_documents
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

-- Private storage bucket for document photos / PDFs.
insert into storage.buckets (id, name, public)
values ('inspection-documents', 'inspection-documents', false)
on conflict (id) do nothing;

create policy "inspection_documents_select_own"
  on storage.objects for select
  using (bucket_id = 'inspection-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "inspection_documents_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'inspection-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "inspection_documents_update_own"
  on storage.objects for update
  using (bucket_id = 'inspection-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "inspection_documents_delete_own"
  on storage.objects for delete
  using (bucket_id = 'inspection-documents' and (storage.foldername(name))[1] = auth.uid()::text);
