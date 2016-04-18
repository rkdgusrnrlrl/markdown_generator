FROM node:4.4.3

RUN mkdir /data
WORKDIR /data

COPY ./ /data/
RUN rm -rf /data/deploy /data/.git
RUN npm install forever -g
RUN npm install
EXPOSE 3000

CMD ["bash"]

