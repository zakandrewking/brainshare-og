-- Set up bucket and table for file uploads
insert into storage.buckets (id, name)
values ('uploaded_files', 'uploaded_files');

create policy "User can create their own file" on storage.objects for insert
    with check (bucket_id = 'uploaded_files' AND auth.role() = 'authenticated');
create policy "User can read their own file"
    on storage.objects for select
    using (bucket_id = 'uploaded_files' AND auth.uid() = owner);


-- Track file upload metadata
create table uploaded_files
(
    "id"         UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    "file_name"  TEXT,
    "owner"      UUID,
    "object_key" TEXT, -- e.g. 'uploaded_files/Book1.56884IBTXK.xlsx'
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    CONSTRAINT "objects_owner_fkey" FOREIGN KEY ("owner") REFERENCES "auth"."users" ("id")
);
alter table uploaded_files
    enable row level security;
create policy "Users can create their own uploads" on uploaded_files for insert
    with check (auth.role() = 'authenticated');
create policy "Users can read their own uploads" on uploaded_files for select using (auth.uid() = owner);
