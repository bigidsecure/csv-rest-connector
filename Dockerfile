# To build:
# cd /media/sf_Git/bigexchange/rest-api-demo/
# docker build -t bigexchange/rest-api-demo:latest .
# docker run --name rest-api-demo -p 8000:8000 -d bigexchange/rest-api-demo:latest

FROM node:14

RUN mkdir -p /usr/src/connector-services/rest-api-demo

WORKDIR /usr/src/connector-services/rest-api-demo

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

CMD npm start
