FROM node:4.4.3

RUN mkdir /data
WORKDIR /data

COPY ./ /data/
RUN rm -rf /data/Dockerfile /data/docker_run_shell.sh /data/.git /data/
RUN npm intall forever -g
EXPOSE 3000

CMD [ "forever", "start", " /data/bin/www"]

