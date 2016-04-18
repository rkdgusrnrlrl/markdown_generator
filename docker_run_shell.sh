#!/bin/bash
while (true); do
    echo "access_token 을 입력해 주세요"
    read ACCESS_TOKEN
    curl -X POST https://api.dropboxapi.com/2/users/get_current_account \
        --header 'Authorization: Bearer ${ACCESS_TOKEN}' \
        --header 'Content-Type: application/json' \
        --data 'null' 2> /dev/null
    OAUTH_ACCESS_TOKEN_SECRET=$(sed -n 's/oauth_token_secret=\([a-z A-Z 0-9]*\)&.*/\1/p' "$RESPONSE_FILE")

done

if [[ "$(docker images -q mark_img:0.1 2> /dev/null)" == "" ]]; then
  docker build -t mark_img:0.1 .
fi

if [[ "$(docker ps | grep mark_cont 2> /dev/null)" == "" ]]; then
  docker rm -f mark_cont
fi

docker run -itd --name mark_cont -p 81:3000 mark_img:0.1 bash
docker exec mark_cont forever start /data/bin/www
