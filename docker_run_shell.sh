#!/bin/bash

echo "Docker 빌드를 시작합니다."

PROJECT_NAME="mark"

IMG_NAME="${PROJECT_NAME}_img"
IMG_VER="0.04"

CONT_NAME="${PROJECT_NAME}_cont"
DOCKER_NETWORK_NAME="docker-network"

DIR=$(pwd)

# if not exist image will be build
if [[ "$(docker images -q "${IMG_NAME}:${IMG_VER}" 2> /dev/null)" == "" ]]; then
  docker build -t "${IMG_NAME}:${IMG_VER}" .
fi

# check docker container exist if exist will be remove
if [[ "$(docker ps -a | grep $CONT_NAME 2> /dev/null)" != "" ]]; then
  docker rm -f $CONT_NAME
fi

#run script
docker run -itd --name $CONT_NAME -v "${DIR}/public:/data/public" -v "${DIR}/log:/data/log" --network $DOCKER_NETWORK_NAME "${IMG_NAME}:${IMG_VER}"
