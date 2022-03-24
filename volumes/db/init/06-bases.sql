-- Set up user database

create table bases
(
    "id"                UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    "name"              TEXT,
    "storage_file_path" TEXT,
    "owner"             UUID,
    "created_at"        timestamptz DEFAULT now(),
    "updated_at"        timestamptz DEFAULT now(),
    CONSTRAINT "objects_owner_fkey" FOREIGN KEY ("owner") REFERENCES "auth"."users" ("id")
);
alter table bases
    enable row level security;
create policy "User can create their own base" on bases for insert
    with check (auth.role() = 'authenticated');
create policy "User can read their own base" on bases for select using (auth.uid() = owner);
create policy "User can update their own base" on bases for update using (auth.uid() = owner);
create policy "User can delete their own base" on bases for delete using (auth.uid() = owner);