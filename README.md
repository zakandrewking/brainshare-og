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
# Start:
docker-compose -f docker-compose.yml -f ./deploy/docker-compose.dev.yml up --build -d
# Stop:
docker-compose down
# Destroy:
docker-compose -f docker-compose.yml -f ./deploy/docker-compose.dev.yml down -v --remove-orphans

docker-compose logs -f

docker exec -it supabase-db psql -h db -p 5432 postgres postgres

# rebuild one container
docker-compose -f docker-compose.yml -f ./deploy/docker-compose.dev.yml up -d --no-deps --build <service name>
```

## Getting emails

For development, you can see emails with inbucket at localhost:9000