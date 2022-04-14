#!/usr/bin/env bash

docker run --name todo -p 5432:5432 -e POSTGRES_USER=todo -e POSTGRES_PASSWORD=todo -e POSTGRES_DB=tododb -d postgres:bullseye ||
docker start todo ||
echo "Unable to run docker container"
