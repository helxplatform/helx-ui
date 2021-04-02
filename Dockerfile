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
RUN make install build

########################
# Production environment
########################
FROM nginx:latest
EXPOSE 80
COPY --from=builder /src/build/frontend /usr/share/nginx/html/
CMD ["nginx", "-g", "daemon off;"]