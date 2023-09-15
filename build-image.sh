#!/bin/bash

TIMESTAMP=`date "+%Y%m%d%H%M"`
IMAGE_NAME="helxplatform/helx-ui"
TAG=pjl-$TIMESTAMP-non-root
REPO="containers.renci.org"

docker build -t $IMAGE_NAME:$TAG -t $REPO/$IMAGE_NAME:$TAG .
