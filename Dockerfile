FROM node:14
ENV NODE_ENV=production

WORKDIR /app/kaschuso-api

COPY ["package.json", "yarn.lock", "./"]

RUN yarn install
COPY . .

EXPOSE 3001
CMD [ "node", "app.js" ]