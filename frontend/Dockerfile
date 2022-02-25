FROM node:16

WORKDIR /app

COPY package.json yarn.lock /app/
RUN yarn install

COPY src /app/src
COPY public /app/public
COPY postcss.config.js tailwind.config.js tsconfig.json /app/

ENV PATH /app/node_modules/.bin:$PATH

EXPOSE 3000

CMD [ "yarn", "start" ]
