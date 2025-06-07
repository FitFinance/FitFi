FROM node:23-alpine

WORKDIR /app

COPY ./package.json .
RUN npm run preinstall
RUN npm i

COPY . .
RUN npm run build

CMD ["npm", "start"]
