FROM node:6.2.1

RUN mkdir /app
ADD package.json /app
WORKDIR /app

RUN npm install

ADD . /app

EXPOSE 3000

CMD npm start