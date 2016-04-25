# 마크다운 변환 웹서버 #

## 동기 ##
마크다운 으로 공부한 내용을 정리하는데, 사람들에게 공유하는데 어려움이 있었다.
처음에는 드롭박스로 md 파일을 관리해서 dropbox 공유 기능을 활용하니 마크다운이 `html`로 변환되어 공유가 되어 잘 활용하였으나
2줄 이상의 코드 `~~~` 에는 작동되지 않았다.
보통 글에 코드가 차지하는 부분이 많이 직접 md 파일을 html 파일로 변환해 배포하는 서버를 만들기로 했다.

## 기능 ##
- dropbox 에 파일을 가져오 html 파일로 변환한다.
- 가져온 md 파일은 저장하여 버전을 체크해 변화가 없으면 저장한 파일을 보여준다.

## 빌드전 준비 사항 ##
- curl 이 설치 되어 있어야 한다.
    - dropbox API를 다루기 위한 token 을 받아오고 검증 시 사용
    - curl 설치 확인 방법
    ~~~bash
    curl --version
    ~~~

- docker 가 설치 되어 있어야 한다.
    - 사용 이유
        - docker 컨테이너는 쉽게 등록 삭제 가 가능함
        - 또 서버를 늘리기가 굉장히 쉬움

- bash 쉘이 있어야 한다.
    - 사용 이유
        - 빌드의 대부분 리눅스 명령어 사용에 연속이기 때문
        - 특히 curl 을 많이 사용

## 빌드 방법 ##
1. 우선 소스를 github 에서 내려받아 `저장할 폴더`에 넣어준다.
~~~bash
git clone https://github.com/rkdgusrnrlrl/markdown_generator.git {저장할 폴더}
~~~
2. `저장할 폴더`로 들어가서 쉘스크립트에 실행 권한을 준다.
~~~bash
cd {저장할 폴더} && ls | grep .sh | xargs -i chmod +x {}
~~~
3. build.sh 을 실행 시킨다.
~~~bash
./build.sh
~~~

## 사용중인 모듈들 ##
- [express](https://www.npmjs.com/package/express) : 라우팅 및 static 서버를 지원해 웹서버 개발하는데 도움이 되었다.
- [marked](https://www.npmjs.com/package/marked) : 마크다운 파일을 html 파일로 변화해 주는 모듈
    - 여러 선택지가 있었으나 github 순위가 markdown 변화 모듈중 가장 높았다.
- [mocha](https://www.npmjs.com/package/mocha) : node.js 에 유명한 테스트 프레임 워크이다 테스트시 활용하였다.
- [chai](https://www.npmjs.com/package/chai) : 테스트시 `expect`, `assert` 등 사용에 활용하였다.
- [chai-as-promised](https://www.npmjs.com/package/chai-as-promised) : promise 테스트 떄문에 사용하고 있는데 아직 제대로 활용 하고 있지 못하다

## 개선할 기능 ##
- json 파일로 받아온 마크다운 파일 저정하기
- 배포 빌드 자동화
- 빌드시 사용자에게 물어봐서 accese_tocken resource.js 저장하기
- docker 사용 유무를 체크해서 docker 컨테이너 올리수 있게 변경(자동화)

## 배운 혹은 배우고 있는 기술 ##
- promise : dropbox api를 활용하기 위해 비동기 코드를 깔끔하게 작성하기 위해 도입
    - 테스트시에 매우 도움이 되고 있다. 정작 promise 테스트 코드를 못짜는게 문제;;
- dropbox api 활용 : md 파일을 받아오기 위해 활용중
- javascript 에서 unit test : mocha 와 chai를 활용하고 있지만 아직 불편함 TDD 적용에 시간이 더 들듯
- git branch and github pull request : 이전에는 master 브런티만 썼는데 dropbox api 모듈화를 위해 브런치를 빼어 사용해봄
- waffle.io : 쓰려고 했는데 github 에 waffle 까지 쓰려니 감당이 안되서 github으로 운영중

## 최종목표 ##
- dropbox 에 md 파일에 의존한 블로깅 서비스
- dropbox 뿐만 아니라 google drive 나 기타 웹서비스도 연동하는 게 목표

