-- From:
-- https://github.com/supabase/pg_graphql/blob/fe024e8a5e94e00547ecd2d6e65a6f839f4f0d3c/dockerfiles/db/setup.sql

-- before creating the extension
create schema graphql;
grant usage on schema graphql to postgres, anon, authenticated, service_role;
alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

create extension if not exists "uuid-ossp";
create extension if not exists pg_graphql cascade;

grant all on function graphql.resolve to postgres, anon, authenticated, service_role;

-- GraphQL Entrypoint
create function graphql("operationName" text default null, query text default null, variables jsonb default null)
    returns jsonb
    language sql
as
$$
select graphql.resolve(query, coalesce(variables, '{}'));
$$;

comment on schema public is '@graphql({"inflect_names": true})';