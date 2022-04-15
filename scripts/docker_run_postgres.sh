#!/usr/bin/env bash

docker run --name "todo_postgres" -p 5432:5432 -e POSTGRES_USER=todo -e POSTGRES_PASSWORD=todo -e POSTGRES_DB=tododb -v $(pwd)/docker/data/postgres:/var/lib/postgresql/data -d postgres:bullseye ||
docker start todo ||
echo "Unable to run docker container"
