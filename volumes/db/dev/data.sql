create table profiles (
  id uuid references auth.users not null,
  updated_at timestamp with time zone,
  name text,

  primary key (id)
);

alter table profiles enable row level security;

create policy "User can view their own profile"
  on profiles for select
  using ( auth.uid() = id );

create policy "User can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "User can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Set up Realtime
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table profiles;

-- Set up Storage
insert into storage.buckets (id, name)
  values ('uploaded_files', 'uploaded_files');

create policy "Users can select their own files."
  on storage.objects for select
  using ( bucket_id = 'uploaded_files' AND auth.uid() = owner );

create policy "Users can upload their own files."
  on storage.objects for insert
  with check ( bucket_id = 'uploaded_files' AND auth.role() = 'authenticated' );

-- Set up user database

create table base (
  id uuid not null,
  name text,
  original_file_path text,
  owner uuid references auth.users not null,

  primary key (id)
);
alter table base enable row level security;

create policy "User can read their own base"
  on base for select
  using ( auth.uid() = owner );

create policy "User can add their own base"
  on base for insert
  with check ( auth.uid() = owner );

create policy "User can edit their own base"
  on base for update
  using ( auth.uid() = owner );

create policy "User can delete their own base"
  on base for delete
  using ( auth.uid() = owner );