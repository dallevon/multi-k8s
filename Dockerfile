FROM node:lts-alpine
ARG BUILD_CONTEXT
ENV BUILD_CONTEXT_ENV=$BUILD_CONTEXT

WORKDIR '/base'

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases .yarn/releases
COPY .yarn/plugins .yarn/plugins
COPY ./packages/$BUILD_CONTEXT/package.json packages/$BUILD_CONTEXT/
RUN yarn install
COPY ./packages/$BUILD_CONTEXT packages/$BUILD_CONTEXT

CMD yarn workspace $BUILD_CONTEXT_ENV start
