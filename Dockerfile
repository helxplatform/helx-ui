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
RUN BUILD_PATH=./build/frontend GENERATE_SOURCEMAP=false npm run build --production --no-audit

########################
# Production environment
########################

FROM nginx:latest
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /usr/src/app/build/ /usr/share/nginx/static/
RUN mv /usr/share/nginx/static/frontend/index.html /usr/share/nginx/html/

WORKDIR /usr/src/app
COPY bin /usr/src/app/bin
ENV PATH="/usr/src/app/bin:${PATH}"


EXPOSE 80
CMD ["start_server", "/usr/share/nginx/static/frontend/env.json"]