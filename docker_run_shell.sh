#!/bin/bash
echo "Docker 빌드를 시작합니다."
DIR=$(pwd)
if [[ "$(docker images -q mark_img:0.2 2> /dev/null)" == "" ]]; then
  docker build -t mark_img:0.2 .
fi

if [[ "$(docker ps -a | grep mark_cont 2> /dev/null)" != "" ]]; then
  docker rm -f mark_cont
fi

docker run -itd --name mark_cont -v ${DIR}/public:/data/public -p 81:3000 mark_img:0.1 b

