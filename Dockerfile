FROM node:7.2.0

RUN mkdir /app
ADD package.json /app
WORKDIR /app

RUN npm install

ADD . /app

EXPOSE 3000

CMD npm start