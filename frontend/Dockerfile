FROM node:16

WORKDIR /app

COPY package.json yarn.lock /app/
RUN yarn install

COPY src/ public/ tsconfig.json /app/

EXPOSE 3000

CMD [ "yarn", "start" ]
