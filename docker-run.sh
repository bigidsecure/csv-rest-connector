#!/usr/bin/env bash
BASEDIR=$(dirname "$0")
docker stop $(docker ps -q --filter ancestor=bigid/rest-api-demo:latest)
docker rmi -f bigid/rest-api-demo:latest;
docker build $BASEDIR -t bigid/rest-api-demo:latest
docker run -d -p 8000:8000 bigid/rest-api-demo:latest
