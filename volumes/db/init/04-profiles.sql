-- profiles
create table profiles
(
    id         uuid primary key,
    updated_at timestamp with time zone,
    name       text
);

alter table profiles
    enable row level security;

create policy "User can view their own profile"
    on profiles for select
    using (auth.uid() = id);

create policy "User can insert their own profile"
    on profiles for insert
    with check (auth.uid() = id);

create policy "User can update own profile"
    on profiles for update using (auth.uid() = id);

-- copy data to public users table to support prisma
-- https://github.com/supabase/supabase/issues/1502#issuecomment-836354621
-- https://supabase.com/docs/guides/auth/managing-user-data#using-triggers

-- inserts a row into public.users
create function public.handle_new_user()
    returns trigger
    language plpgsql
    security definer set search_path = public
as
$$
begin
    insert into public.profiles (id)
    values (new.id);
    return new;
end;
$$;

-- trigger the function every time a user is created
create trigger on_auth_user_created
    after insert
    on auth.users
    for each row
execute procedure public.handle_new_user();

-- Set up Realtime
begin;
drop publication if exists supabase_realtime;
create publication supabase_realtime;
commit;
alter publication supabase_realtime add table profiles;

-- Set up bucket and table for file uploads
insert into storage.buckets (id, name)
values ('uploaded_files', 'uploaded_files');

create policy "Users can select their own files."
    on storage.objects for select
    using (bucket_id = 'uploaded_files' AND auth.uid() = owner);

create policy "Users can upload their own files."
    on storage.objects for insert
    with check (bucket_id = 'uploaded_files' AND auth.role() = 'authenticated');

create table uploaded_files
(
    "id"        UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    "file_name" text,
    "owner"     uuid,
    "object_id" text,
    CONSTRAINT "objects_owner_fkey" FOREIGN KEY ("owner") REFERENCES "auth"."users" ("id"),
    CONSTRAINT "objects_objectId_fkey" FOREIGN KEY ("object_id") REFERENCES "storage"."objects" ("id")
);
alter table base
    enable row level security;

create policy "Users can select their own uploads"
    on uploaded_files for select
    using (auth.uid() = owner);

create policy "Users can insert their own uploads"
    on uploaded_files for insert
    with check (auth.uid() = owner);

-- Set up user database

create table base
(
    id                 uuid primary key,
    name               text,
    original_file_path text,
    owner              uuid references profiles not null
);
alter table base
    enable row level security;

create policy "User can read their own base"
    on base for select
    using (auth.uid() = owner);

create policy "User can add their own base"
    on base for insert
    with check (auth.uid() = owner);

create policy "User can edit their own base"
    on base for update
    using (auth.uid() = owner);

create policy "User can delete their own base"
    on base for delete
    using (auth.uid() = owner);