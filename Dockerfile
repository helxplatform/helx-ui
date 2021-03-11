# Build environment
###################
FROM node:10.12.0-alpine AS builder
# Create and set working directory
RUN mkdir /src
WORKDIR /src
# Add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /src/node_modules/.bin:$PATH
# Environment variable
# ...
# Install and cache app dependencies
RUN apk add git
COPY package*.json /src/
RUN npm install
# Copy in source files
COPY . /src
# Build app
RUN npm run build
# Production environment
########################
FROM nginx:latest
RUN apt-get update && apt-get install nano tree -y
EXPOSE 80
COPY --from=builder /src/build /usr/share/nginx/html/
CMD ["nginx", "-g", "daemon off;"]