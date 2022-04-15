FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

ARG port=8080
ENV PORT=$port
ENV NODE_ENV="prod"

EXPOSE $port

CMD [ "npm", "run", "pm2" ]
