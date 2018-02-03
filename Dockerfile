FROM keymetrics/pm2:latest

RUN mkdir /data
COPY . /data/
# delete files
RUN rm -rf /data/Dockerfile /data/.git /data/docker_run_shell.sh
RUN rm -rf /data/deploy /data/.git

RUN npm install

WORKDIR /data
RUN npm i

CMD ["pm2-docker", "start", "pm2.json"]