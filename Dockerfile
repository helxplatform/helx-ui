###################
# Build environment
###################
FROM node:18.16-alpine AS builder
RUN apt remove libtiff6 libxml2 libheif1 libldap-2.5-0 libde265-0 libdav1d6

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

FROM nginx:latest
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /usr/src/app/build/ /usr/share/nginx/static/
# RUN mv /usr/share/nginx/static/frontend/index.html /usr/share/nginx/html/

WORKDIR /usr/src/app
COPY bin /usr/src/app/bin
ENV PATH="/usr/src/app/bin:${PATH}"


EXPOSE 80
CMD ["start_server", "/usr/share/nginx/static/frontend/env.json"]