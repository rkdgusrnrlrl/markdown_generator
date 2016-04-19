#!/bin/bash
echo "Docker 빌드를 시작합니다."
if [[ "$(docker images -q mark_img:0.1 2> /dev/null)" == "" ]]; then
  docker build -t mark_img:0.1 .
fi

if [[ "$(docker ps | grep mark_cont 2> /dev/null)" != "" ]]; then
  docker rm -f mark_cont
fi

docker run -itd --name mark_cont -p 81:3000 mark_img:0.1 bash
docker exec mark_cont forever start /data/bin/www
