FROM node:16.20.0-alpine as base

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install
RUN npm install -g @angular/cli@10.2.4
# Copy app source code
COPY . .

EXPOSE 4200

RUN ng build
# start app
CMD ng serve --host 0.0.0.0

