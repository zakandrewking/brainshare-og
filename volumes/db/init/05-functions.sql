-- Set up functions. From:
-- https://github.com/supabase-community/supabase-graphql-example/blob/259b3c6522179708867b5e84aa6e714f50da40e8/data/db/schema.sql#L79


-- create net extension
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
COMMENT ON EXTENSION pg_net IS 'Async HTTP';


-- create supabase_functions schema
CREATE SCHEMA supabase_functions;
ALTER DEFAULT privileges IN SCHEMA supabase_functions 
    GRANT all ON functions TO postgres, anon, authenticated, service_role;


-- auditing table
CREATE TABLE supabase_functions.hooks (
    "id"              BIGSERIAL PRIMARY KEY,
    hook_table_id integer NOT NULL,
    hook_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    request_id bigint
);
COMMENT ON TABLE supabase_functions.hooks IS 'Supabase Functions Hooks: Audit trail for triggered hooks.';


-- create http_request function
CREATE FUNCTION supabase_functions.http_request() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'supabase_functions'
    AS $$
      DECLARE
        request_id bigint;
        payload jsonb;
        url text := TG_ARGV[0]::text;
        method text := TG_ARGV[1]::text;
        headers jsonb DEFAULT '{}'::jsonb;
        params jsonb DEFAULT '{}'::jsonb;
        timeout_ms integer DEFAULT 1000;
      BEGIN
        IF url IS NULL OR url = 'null' THEN
          RAISE EXCEPTION 'url argument is missing';
        END IF;

        IF method IS NULL OR method = 'null' THEN
          RAISE EXCEPTION 'method argument is missing';
        END IF;

        IF TG_ARGV[2] IS NULL OR TG_ARGV[2] = 'null' THEN
          headers = '{"Content-Type": "application/json"}'::jsonb;
        ELSE
          headers = TG_ARGV[2]::jsonb;
        END IF;

        IF TG_ARGV[3] IS NULL OR TG_ARGV[3] = 'null' THEN
          params = '{}'::jsonb;
        ELSE
          params = TG_ARGV[3]::jsonb;
        END IF;

        IF TG_ARGV[4] IS NULL OR TG_ARGV[4] = 'null' THEN
          timeout_ms = 1000;
        ELSE
          timeout_ms = TG_ARGV[4]::integer;
        END IF;

        CASE
          WHEN method = 'GET' THEN
            SELECT http_get INTO request_id FROM net.http_get(
              url,
              params,
              headers,
              timeout_ms
            );
          WHEN method = 'POST' THEN
            payload = jsonb_build_object(
              'old_record', OLD,
              'record', NEW,
              'type', TG_OP,
              'table', TG_TABLE_NAME,
              'schema', TG_TABLE_SCHEMA
            );

            SELECT http_post INTO request_id FROM net.http_post(
              url,
              payload,
              params,
              headers,
              timeout_ms
            );
          ELSE
            RAISE EXCEPTION 'method argument % is invalid', method;
        END CASE;

        INSERT INTO supabase_functions.hooks
          (hook_table_id, hook_name, request_id)
        VALUES
          (TG_RELID, TG_NAME, request_id);

        RETURN NEW;
      END
    $$;


-- set privileges for http_request function
ALTER FUNCTION supabase_functions.http_request()
    OWNER TO postgres;