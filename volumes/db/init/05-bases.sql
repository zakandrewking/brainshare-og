-- Set up user database

create table bases
(
    id                 uuid primary key,
    name               text,
    original_file_path text,
    owner              uuid references auth.users not null
);

alter table bases
    enable row level security;

create policy "User can read their own base"
    on bases for select
    using (auth.uid() = owner);

create policy "User can add their own base"
    on bases for insert
    with check (auth.uid() = owner);

create policy "User can edit their own base"
    on bases for update
    using (auth.uid() = owner);

create policy "User can delete their own base"
    on bases for delete
    using (auth.uid() = owner);