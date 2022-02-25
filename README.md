# brainshare

why screen share when you can brainshare?

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
# Start /rebuild dev
docker-compose up --build -d

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

For development, you can see emails with inbucket at localhost:9000
