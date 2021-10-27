###################
# Build environment
###################
FROM node:14.16.1-alpine AS builder

ARG REACT_APP_WORKSPACES_ENABLED=true
ENV REACT_APP_WORKSPACES_ENABLED=$REACT_APP_WORKSPACES_ENABLED

# Copy and install requirements
WORKDIR /usr/src/app
COPY --chown=node:node "package*.json" /usr/src/app/
RUN npm ci --only=production

COPY --chown=node:node . /usr/src/app
RUN BUILD_PATH=./build/frontend npm run build --production --no-audit

########################
# Production environment
########################

FROM nginxinc/nginx-unprivileged:latest

COPY --from=builder --chown=nginx /usr/src/app/build/ /usr/share/nginx/static/
COPY --from=builder --chown=nginx /usr/src/app/build/frontend/index.html /usr/share/nginx/html/index.html

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/nginx.conf

COPY --chown=nginx bin /usr/src/app/bin

ENV PATH="/usr/src/app/bin:${PATH}"

EXPOSE 8080

WORKDIR /usr/src/app

CMD ["start_server", "/usr/share/nginx/static/frontend/env.json"]