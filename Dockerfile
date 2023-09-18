###################
# Build environment
###################
FROM node:lts-bullseye-slim AS builder

ARG REACT_APP_WORKSPACES_ENABLED=true
ENV REACT_APP_WORKSPACES_ENABLED=$REACT_APP_WORKSPACES_ENABLED

# Copy and install requirements
WORKDIR /usr/src/app
COPY --chown=node:node "package*.json" /usr/src/app/
RUN npm install -g npm@latest
RUN npm  clean-install

COPY --chown=node:node . /usr/src/app
RUN npm run build

########################
# Production environment
########################

FROM nginx:1.25.1-alpine-slim

# Ensure a rootless container
RUN addgroup -g 1000 -S helxui && \
    adduser -u 1000 -h /helxui -G helxui -S helxui

COPY --chown=helxui:helxui nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --chown=helxui:helxui nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder --chown=helxui:helxui /usr/src/app/build/ /usr/share/nginx/static/
COPY --chown=helxui:helxui bin /usr/src/app/bin
ENV PATH="/usr/src/app/bin:${PATH}"
# RUN mv /usr/share/nginx/static/frontend/index.html /usr/share/nginx/html/
WORKDIR /usr/src/app

EXPOSE 80
CMD ["start_server", "/usr/share/nginx/static/frontend/env.json"]