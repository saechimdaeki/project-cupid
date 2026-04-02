create extension if not exists "pgcrypto";

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'cupid_membership_status'
  ) then
    create type public.cupid_membership_status as enum ('pending', 'approved', 'rejected');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'cupid_app_role'
  ) then
    create type public.cupid_app_role as enum ('super_admin', 'admin', 'viewer');
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'cupid_app_role'
      and e.enumlabel = 'matcher'
  ) then
    alter type public.cupid_app_role rename value 'matcher' to 'viewer';
  end if;
exception
  when invalid_parameter_value then null;
end $$;

alter type public.cupid_app_role add value if not exists 'admin';
alter type public.cupid_app_role add value if not exists 'viewer';

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'cupid_candidate_status'
  ) then
    create type public.cupid_candidate_status as enum ('active', 'matched', 'couple', 'graduated', 'archived');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'cupid_match_outcome'
  ) then
    create type public.cupid_match_outcome as enum ('intro_sent', 'first_meeting', 'dating', 'couple', 'closed');
  end if;
end $$;

create table if not exists public.cupid_memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  full_name text not null,
  role public.cupid_app_role not null default 'viewer',
  status public.cupid_membership_status not null default 'pending',
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.cupid_memberships
  add column if not exists username text;

update public.cupid_memberships
set username = coalesce(username, split_part(full_name, ' ', 1), user_id::text)
where username is null;

alter table public.cupid_memberships
  alter column username set not null;

create unique index if not exists cupid_memberships_username_key
on public.cupid_memberships (lower(username));

create table if not exists public.cupid_candidates (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  birth_year int not null check (birth_year between 1960 and 2010),
  gender text not null,
  region text not null,
  occupation text not null,
  work_summary text not null default '',
  education text not null,
  religion text not null,
  mbti text,
  personality_summary text not null,
  ideal_type text not null,
  notes_private text not null,
  status public.cupid_candidate_status not null default 'active',
  highlight_tags text[] not null default '{}',
  image_url text,
  paired_candidate_id uuid references public.cupid_candidates(id),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cupid_candidates
  add column if not exists work_summary text not null default '';

alter table public.cupid_candidates
  add column if not exists paired_candidate_id uuid references public.cupid_candidates(id);

update public.cupid_candidates
set gender = case
  when gender in ('남성', '남') then '남'
  when gender in ('여성', '여') then '여'
  else gender
end;

alter table public.cupid_candidates
  drop constraint if exists cupid_candidates_gender_check;

alter table public.cupid_candidates
  add constraint cupid_candidates_gender_check
  check (gender in ('남', '여'));

create table if not exists public.cupid_candidate_photos (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.cupid_candidates(id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.cupid_match_records (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.cupid_candidates(id) on delete cascade,
  counterpart_label text not null,
  counterpart_candidate_id uuid references public.cupid_candidates(id) on delete set null,
  matchmaker_id uuid references auth.users(id),
  matchmaker_name text not null,
  outcome public.cupid_match_outcome not null default 'intro_sent',
  summary text not null,
  happened_on date not null,
  created_at timestamptz not null default now()
);

alter table public.cupid_match_records
  add column if not exists counterpart_candidate_id uuid references public.cupid_candidates(id) on delete set null;

create index if not exists cupid_candidates_paired_candidate_id_idx
on public.cupid_candidates (paired_candidate_id);

create index if not exists cupid_match_records_counterpart_candidate_id_idx
on public.cupid_match_records (counterpart_candidate_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'sogaeting',
  'sogaeting',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.cupid_is_approved_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.cupid_memberships
    where user_id = auth.uid()
      and status = 'approved'
  );
$$;

create or replace function public.cupid_is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.cupid_memberships
    where user_id = auth.uid()
      and status = 'approved'
      and role = 'super_admin'
  );
$$;

create or replace function public.cupid_username_exists(input_username text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.cupid_memberships
    where lower(username) = lower(trim(input_username))
  );
$$;

create or replace function public.cupid_can_view_candidate_detail()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.cupid_memberships
    where user_id = auth.uid()
      and status = 'approved'
      and role::text in ('super_admin', 'admin')
  );
$$;

create or replace function public.cupid_can_edit_candidates()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.cupid_memberships
    where user_id = auth.uid()
      and status = 'approved'
      and role::text in ('super_admin', 'admin')
  );
$$;

alter table public.cupid_memberships enable row level security;
alter table public.cupid_candidates enable row level security;
alter table public.cupid_candidate_photos enable row level security;
alter table public.cupid_match_records enable row level security;

drop policy if exists "cupid_members can read own membership" on public.cupid_memberships;
create policy "cupid_members can read own membership"
on public.cupid_memberships
for select
to authenticated
using (user_id = auth.uid() or public.cupid_is_super_admin());

drop policy if exists "cupid_super_admin manages memberships" on public.cupid_memberships;
create policy "cupid_super_admin manages memberships"
on public.cupid_memberships
for all
to authenticated
using (public.cupid_is_super_admin())
with check (public.cupid_is_super_admin());

create or replace function public.cupid_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.cupid_memberships (user_id, username, full_name, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    'viewer',
    'pending'
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_cupid on auth.users;
create trigger on_auth_user_created_cupid
after insert on auth.users
for each row execute procedure public.cupid_handle_new_user();

drop policy if exists "cupid_approved members read candidates" on public.cupid_candidates;
create policy "cupid_approved members read candidates"
on public.cupid_candidates
for select
to authenticated
using (public.cupid_is_approved_member());

drop policy if exists "cupid_approved members write candidates" on public.cupid_candidates;
create policy "cupid_approved members write candidates"
on public.cupid_candidates
for all
to authenticated
using (public.cupid_can_edit_candidates())
with check (public.cupid_can_edit_candidates());

drop policy if exists "cupid_approved members read candidate photos" on public.cupid_candidate_photos;
create policy "cupid_approved members read candidate photos"
on public.cupid_candidate_photos
for select
to authenticated
using (public.cupid_can_view_candidate_detail());

drop policy if exists "cupid_approved members write candidate photos" on public.cupid_candidate_photos;
create policy "cupid_approved members write candidate photos"
on public.cupid_candidate_photos
for all
to authenticated
using (public.cupid_can_edit_candidates())
with check (public.cupid_can_edit_candidates());

drop policy if exists "cupid_approved members read matches" on public.cupid_match_records;
create policy "cupid_approved members read matches"
on public.cupid_match_records
for select
to authenticated
using (public.cupid_can_view_candidate_detail());

drop policy if exists "cupid_approved members write matches" on public.cupid_match_records;
create policy "cupid_approved members write matches"
on public.cupid_match_records
for all
to authenticated
using (public.cupid_can_edit_candidates())
with check (public.cupid_can_edit_candidates());

drop policy if exists "cupid_detail roles read private candidate photos" on storage.objects;
create policy "cupid_detail roles read private candidate photos"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'sogaeting'
  and public.cupid_can_view_candidate_detail()
);

drop policy if exists "cupid_edit roles upload private candidate photos" on storage.objects;
create policy "cupid_edit roles upload private candidate photos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'sogaeting'
  and public.cupid_can_edit_candidates()
);

drop policy if exists "cupid_edit roles update private candidate photos" on storage.objects;
create policy "cupid_edit roles update private candidate photos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'sogaeting'
  and public.cupid_can_edit_candidates()
)
with check (
  bucket_id = 'sogaeting'
  and public.cupid_can_edit_candidates()
);

drop policy if exists "cupid_edit roles delete private candidate photos" on storage.objects;
create policy "cupid_edit roles delete private candidate photos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'sogaeting'
  and public.cupid_can_edit_candidates()
);
