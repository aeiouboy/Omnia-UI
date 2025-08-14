FROM node:20-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN apt-get update -y && apt-get install -y openssl 

RUN pnpm install

COPY . .

RUN pnpm migration:run

RUN pnpm build

EXPOSE  3000 3001

CMD ["pnpm","start:prod"]
