# brainshare

why screen share when you can brainshare?

# inspiration & acknowledgment

brainshare is heavily based on [supabase](https://github.com/supabase/supabase) 
and relies on the open source contributions of probably tens of thousands of 
developers on hundreds of projects (would be cool to count them up!)

- https://github.com/supabase/supabase 
- https://github.com/themesberg/flowbite

# Known issues

## Can't click the file upload button in Safari (but drag-drop works)

Give Full Disk Access to Safari.app in System Preferences > Security and Privacy > Privacy ... annoying!

# Docs

## dev prep

```
brew install buildkit
# might need to add COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 to shell config

cp .env.example .env
```

## Commands

```
# Start
docker-compose up -d

# Build and start
docker-compose up --build -d

# Rebuild just database
docker-compose down -v && docker-compose up -d db && docker-compose logs -f db
# follow with docker-compose up

# Stop
docker-compose down

# Destroy
docker-compose down -v --remove-orphans

# show logs
docker-compose logs -f
docker-compose logs -f <service name>

# connect to db
docker-compose exec db psql -h db -p 5432 postgres postgres

# rebuild one container
docker-compose up -d --no-deps --build <service name>

# restart one container
docker-compose restart <service name>
```

## Ports

Runs the application at http://localhost:3000

Supabase console is at http://localhost:4000

Graphiql is at http://localhost:8000 - add headers like `{"apikey": "<token>", "Authorization": "Bearer <token>"}`

For development, you can see emails with inbucket at http://localhost:9000

## REST

Can use ANON_KEY for unauthenticated endpoints (incl. no RLS enabled) or
SERVICE_KEY for full access (danger!).

```
http http://localhost:3000/rest/v1/<table-name> \
  apikey:$TOKEN -A bearer -a $TOKEN \
  | jless
```