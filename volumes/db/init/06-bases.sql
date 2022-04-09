-- Set up user database

CREATE SEQUENCE bases_dev_port_seq AS INTEGER START 8400; -- base ports increment from here
create table bases
(
    "id"                UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    "name"              TEXT,
    "storage_file_path" TEXT,
    "owner"             UUID,
    "dev_port"          INTEGER DEFAULT nextval('bases_dev_port_seq'),
    "created_at"        timestamptz DEFAULT now(),
    "updated_at"        timestamptz DEFAULT now(),
    CONSTRAINT "objects_owner_fkey" FOREIGN KEY ("owner") REFERENCES "auth"."users" ("id")
);
ALTER SEQUENCE bases_dev_port_seq OWNED BY bases.dev_port;

alter table bases
    enable row level security;
create policy "User can create their own base" on bases for insert
    with check (auth.role() = 'authenticated');
create policy "User can read their own base" on bases for select using (auth.uid() = owner);
create policy "User can update their own base" on bases for update using (auth.uid() = owner);
create policy "User can delete their own base" on bases for delete using (auth.uid() = owner);