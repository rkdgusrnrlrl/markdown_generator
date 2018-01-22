#!/bin/bash

#인자값을 파싱함
while getopts "hp:" opt; do
    case $opt in
        h)
            echo "-p 사용할 포트"
            ;;
        p)
            PORT=$OPTARG
            ;;
        \?)
            exit;
            ;;
    esac
done


while (true); do
	echo "아래 url 로 접속하여 API 요청 승인해주세요."
	echo "https://www.dropbox.com/1/oauth2/authorize?response_type=code&client_id=1v3tq51frfy4t08"
	echo "승인후 받은 access_code을 입력해주세요"
	read ACCESS_CODE
	
	#access_code 로 access_tocken을 받아오는 requst 를 날림 https://www.dropbox.com/developers-v1/core/docs#oa2-token 참조
	CURL_COMMEND="curl -X POST -s https://api.dropboxapi.com/1/oauth2/token -d code=${ACCESS_CODE} -d grant_type=authorization_code -u 1v3tq51frfy4t08:5xu6rixcmr3vptn -o auth.json"
	eval $CURL_COMMEND

	#responce 에서 access_tocken 값을 추출함
	ACCESS_TOKEN=`sed 's/^.*"access_token": "\([^"]*\)".*$/\1/' auth.json`
	rm auth.json

	#ACCESS_TOKEN 은 64자 이고, 값이 비었는지 체크 이것이 돼면 성공으로 간주
	if [ "$ACCESS_TOKEN" != "" -a ${#ACCESS_TOKEN} -eq 64 ]
	then
		
		#받은 ACCESS_TOKEN 이 정상인지 테스트 하기 위해 user 정보를 가져오는 request
		#참조 : https://dropbox.github.io/dropbox-api-v2-explorer/#users_get_current_account
		CURL_COMMEND="curl -X POST -s  https://api.dropboxapi.com/2/users/get_current_account --header \"Authorization: Bearer ${ACCESS_TOKEN}\" --header \"Content-Type: application/json\" --data \"null\" -o tmp.json"
		eval ${CURL_COMMEND}
		
		if [[ $JSON == *"error_summary"* ]]
		then
			echo "실패하였습니다."
		else
			#response 사용자 명을 추출함
			NAME=`sed 's/^.*"display_name": "\([^"]*\)".*$/\1/' tmp.json`
			rm tmp.json

			echo "사용자명 : ${NAME}"
			echo "사용자명이 맞습니까?(y/n)"
			read IS_SUCCESS

			if [ ${IS_SUCCESS} == "y" ]
			then
				echo "access_tocken 저장을 성공적으로 마쳤습니다."

				#ACCESS_TOKEN 을 resource.json 에 저장
				mkdir -p resource
				echo "{\"accessTocken\":\"${ACCESS_TOKEN}\"}" > resource/resource.json

				#docker run 실행
				./docker_run_shell.sh -p ${PORT}
				break
			fi
		fi
	else
		echo "잘못된 access_code 입니다."
	fi
done;



