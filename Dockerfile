# Use Node.js 16.20 as the base image
FROM node:16.20

RUN mkdir /project
WORKDIR /project

RUN npm install -g @angular/cli@10.2.4

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
CMD ["ng", "serve", "--host", "0.0.0.0"]

