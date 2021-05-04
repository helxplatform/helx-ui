###################
# Build environment
###################
FROM node:14.16.1-alpine AS builder
RUN apk add make
# Create and set working directory
RUN mkdir /src
WORKDIR /src
# Copy in source files
COPY . /src
# Build app
ENV REACT_APP_HELX_SEARCH_URL=https://helx.renci.org
RUN make clean install.npm lint test build.npm

########################
# Production environment
########################
FROM nginx:latest
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /src/build/ /usr/share/nginx/static/
RUN mv /usr/share/nginx/static/helx/index.html /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]