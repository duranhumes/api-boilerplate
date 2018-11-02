FROM node:10-alpine

ARG DIR
ENV DIR /usr/src/app

RUN mkdir -p $DIR
WORKDIR $DIR

COPY . $DIR

RUN apk update && apk --no-cache add \
    --virtual native-deps g++ gcc libgcc \
    libstdc++ linux-headers make python build-base \
    yarn && npm install --global --quiet node-gyp

RUN yarn install

EXPOSE 8080

CMD ["yarn", "dev"]
