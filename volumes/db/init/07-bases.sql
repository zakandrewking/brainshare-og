-- Set up user database

CREATE SEQUENCE bases_dev_port_seq AS INTEGER START 8400; -- base ports increment from here
create table bases
(
    "id"                UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    "name"              TEXT NOT NULL UNIQUE,
    "storage_file_path" TEXT,
    "owner"             UUID,
    "dev_port"          INTEGER UNIQUE DEFAULT nextval('bases_dev_port_seq'),
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

-- trigger function on insert
-- TODO which user calls the function?
-- TODO how to pass auth?
-- perl -i -pe "s~WEBHOOK_URL~${WEBHOOK_URL}~g" ./migrations_replaced/*
-- perl -i -pe "s~WEBHOOK_SECRET~${WEBHOOK_SECRET}~g" ./migrations_replaced/*
CREATE TRIGGER bases_insert
    AFTER INSERT
    ON public.bases
    FOR EACH ROW
EXECUTE FUNCTION supabase_functions.http_request(
        'http://function-server:5000/create-db', 'POST',
        '{"Content-type":"application/json","Authorization":"FUNCTIONS_SECRET","Event":"bases.insert"}', '{}', '1000');

-- trigger function on delete
CREATE TRIGGER bases_delete
    AFTER DELETE
    ON public.bases
    FOR EACH ROW
EXECUTE FUNCTION supabase_functions.http_request(
        'http://function-server:5000/delete-db', 'POST',
        '{"Content-type":"application/json","Authorization":"FUNCTIONS_SECRET","Event":"bases.insert"}', '{}', '1000');