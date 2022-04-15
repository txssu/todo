#!/usr/bin/env bash

docker run -e "DATABASE_URI=postgres://todo:todo@localhost/todo_prod?sslmode=disable" --network "host" --name "todo_app" -t -d wmean-spec/todo

