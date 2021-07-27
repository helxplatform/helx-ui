FROM node:14.16.1-alpine AS build

# Copy and install requirements
WORKDIR /usr/src/app
COPY "package*.json" /usr/src/app/
RUN npm ci --only=production

############

FROM node:14.16.1-alpine
ENV NODE_ENV production
USER node
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node . /usr/src/app

CMD npm run start