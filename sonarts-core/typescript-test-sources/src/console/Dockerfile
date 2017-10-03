FROM mhart/alpine-node

RUN apk add --update git build-base python

COPY . /app
WORKDIR /app

RUN npm install -g yarn
RUN yarn install

RUN apk del git build-base python

ENV BACKEND_ADDR **None**

EXPOSE 4000

CMD ["npm", "start"]
