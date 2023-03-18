FROM node:14.21.3 AS build

RUN mkdir /app
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:lts-slim
RUN mkdir /app && chown node:node /app
USER node
WORKDIR /app
COPY --from=build /app/package.json /app/package-lock.json /app/buildMeta.json ./
COPY --from=build /app/dist ./dist
RUN npm install --production

CMD [ "node", "dist/src" ]
