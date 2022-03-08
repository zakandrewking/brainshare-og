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

alter table uploaded_files
    enable row level security;

create policy "Users can select their own uploads"
    on uploaded_files for select
    using (auth.uid() = owner);

create policy "Users can insert their own uploads"
    on uploaded_files for insert
    with check (auth.uid() = owner);