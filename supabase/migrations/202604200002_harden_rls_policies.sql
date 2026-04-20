alter table public.photo_sessions enable row level security;
alter table public.contact_messages enable row level security;

revoke all on table public.photo_sessions from anon, authenticated;
revoke all on table public.contact_messages from anon, authenticated;

-- photo_sessions: clients can insert, but read access is admin-only.
drop policy if exists photo_sessions_insert_client on public.photo_sessions;
create policy photo_sessions_insert_client
on public.photo_sessions
for insert
to anon, authenticated
with check (
  total_shots between 1 and 8
  and layout_id in ('A', 'B', 'C', 'D')
);

drop policy if exists photo_sessions_select_admin on public.photo_sessions;
create policy photo_sessions_select_admin
on public.photo_sessions
for select
to authenticated
using (
  coalesce((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false) = true
);

-- contact_messages: open insert, admin read only.
drop policy if exists contact_messages_insert_client on public.contact_messages;
create policy contact_messages_insert_client
on public.contact_messages
for insert
to anon, authenticated
with check (
  char_length(name) between 2 and 120
  and position('@' in email) > 1
  and char_length(message) between 10 and 3000
);

drop policy if exists contact_messages_select_admin on public.contact_messages;
create policy contact_messages_select_admin
on public.contact_messages
for select
to authenticated
using (
  coalesce((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false) = true
);

drop policy if exists contact_messages_update_admin on public.contact_messages;
create policy contact_messages_update_admin
on public.contact_messages
for update
to authenticated
using (
  coalesce((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false) = true
)
with check (
  coalesce((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false) = true
);

drop policy if exists contact_messages_delete_admin on public.contact_messages;
create policy contact_messages_delete_admin
on public.contact_messages
for delete
to authenticated
using (
  coalesce((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false) = true
);

-- Storage object access for photobooth uploads.
-- Insert allows client uploads with strict path pattern: <uuid>/shot-<n>.jpg
-- Reads are authenticated-only. Admins bypass path checks.
drop policy if exists storage_upload_photobooth_client on storage.objects;
create policy storage_upload_photobooth_client
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'photobooth-uploads'
  and name ~* '^[0-9a-f-]{36}/shot-[0-9]+\\.jpg$'
);

drop policy if exists storage_read_photobooth_user_or_admin on storage.objects;
create policy storage_read_photobooth_user_or_admin
on storage.objects
for select
to authenticated
using (
  bucket_id = 'photobooth-uploads'
  and (
    split_part(name, '/', 1) = auth.uid()::text
    or coalesce((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false) = true
  )
);

drop policy if exists storage_update_photobooth_admin on storage.objects;
create policy storage_update_photobooth_admin
on storage.objects
for update
to authenticated
using (
  bucket_id = 'photobooth-uploads'
  and coalesce((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false) = true
)
with check (
  bucket_id = 'photobooth-uploads'
  and coalesce((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false) = true
);

drop policy if exists storage_delete_photobooth_admin on storage.objects;
create policy storage_delete_photobooth_admin
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'photobooth-uploads'
  and coalesce((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false) = true
);
