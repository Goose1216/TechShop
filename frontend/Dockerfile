FROM node:12-alpine as builder

WORKDIR /frontend

COPY public ./public
COPY src ./src
COPY package.json .

RUN npm install