#!/usr/bin/env bash
docker build . -t wmean-spec/todo --build-arg port=8080
