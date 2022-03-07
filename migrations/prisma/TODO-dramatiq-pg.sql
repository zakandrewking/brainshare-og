adapt https://gitlab.com/dalibo/dramatiq-pg/-/blob/master/dramatiq_pg/schema.sql

does dramatiq_pg use `skip locked`? no, it uses notify

need a cron function to clear out old jobs too

TODO should replace /volumes/db/dev
TODO move /volumes/db/init here