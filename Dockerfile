###################
# Build environment
###################
FROM node:10.12.0-alpine AS builder
RUN apk add make
# Create and set working directory
RUN mkdir /src
WORKDIR /src
# Copy in source files
COPY . /src
# Build app
ENV REACT_APP_HELX_SEARCH_URL=https://helx.renci.org
ENV REACT_APP_HELX_APPSTORE_URL=http://0.0.0.0:8000
RUN make install build

########################
# Production environment
########################
FROM nginx:latest
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /src/build/ /usr/share/nginx/static/
RUN mv /usr/share/nginx/static/frontend/index.html /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]