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
