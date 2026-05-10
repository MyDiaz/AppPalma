# Use Node.js 16.20 as the base image
FROM node:16.20

RUN mkdir /project
WORKDIR /project

RUN npm install -g @angular/cli@10.2.4

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV BASE_HREF=/sigpa/
CMD ng serve --prod --host 0.0.0.0 --publicHost "simon.uis.edu.co" --base-href "$BASE_HREF" --disable-host-check

# RUN node scripts/ng-build.js build --prod
# CMD ["node", "server.js"]