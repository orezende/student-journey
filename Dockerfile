FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY lib/db/package.json ./lib/db/
COPY lib/http/package.json ./lib/http/
COPY lib/messaging/package.json ./lib/messaging/
COPY lib/observability/package.json ./lib/observability/
COPY lib/testing/package.json ./lib/testing/
COPY lib/types/package.json ./lib/types/
RUN npm ci

COPY . .
RUN npx tsc

CMD ["node", "dist/src/server.js"]
