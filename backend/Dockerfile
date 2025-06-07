FROM node:23-alpine

WORKDIR /app

COPY ./package.json .
RUN npm run preinstall
RUN npm i

RUN npm run docs

COPY . .
RUN npm run build

CMD ["npm", "start"]
