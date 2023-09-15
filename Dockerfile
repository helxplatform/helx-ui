###################
# Build environment
###################
FROM node:lts-bullseye-slim AS builder

ARG REACT_APP_WORKSPACES_ENABLED=true
ENV REACT_APP_WORKSPACES_ENABLED=$REACT_APP_WORKSPACES_ENABLED

# Copy and install requirements
WORKDIR /usr/src/app
COPY --chown=node:node "package*.json" /usr/src/app/
RUN npm i -g npm@latest
RUN npm ci

COPY --chown=node:node . /usr/src/app
RUN npm run build

########################
# Production environment
########################

FROM nginx:1.25.1-alpine-slim
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /usr/src/app/build/ /usr/share/nginx/static/
# RUN mv /usr/share/nginx/static/frontend/index.html /usr/share/nginx/html/

RUN apk upgrade
RUN apk add bash

WORKDIR /usr/src/app
COPY bin /usr/src/app/bin
ENV PATH="/usr/src/app/bin:${PATH}"


EXPOSE 80
CMD ["start_server", "/usr/share/nginx/static/frontend/env.json"]