# From:
# https://github.com/supabase/pg_graphql/tree/df4fe24c09ea7174879815db754d4f0534fed779/dockerfiles/graphiql

FROM python:3.9.7-alpine

COPY . /graphiql
WORKDIR /graphiql
CMD ["python", "-m", "http.server", "8000"]