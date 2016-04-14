#!/bin/bash
if [[ "$(docker images -q mark_img:0.1 2> /dev/null)" == "" ]]; then
  docker build -t mark_img:0.1 .
fi

docker run -itd --name mark_cont -p 81:3000 mark_img:0.1 bash
docker exec mark_cont forever start /data/bin/www
