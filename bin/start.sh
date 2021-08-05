#!/bin/bash

workspaces_enabled="${REACT_APP_WORKSPACES_ENABLED:-true}"
search_enabled="${REACT_APP_SEARCH_ENABLED:-true}"
search_url="${REACT_APP_SEARCH_URL}"

if [ -z "$1" ]
  then
    echo "Usage: start.sh /path/to/output/env.js"
    exit 1
fi

sed \
  -e "s/%WORKSPACES_ENABLED%/$workspaces_enabled/" \
  -e "s/%SEARCH_ENABLED%/$search_enabled/" \
  -e "s/%SEARCH_URL%/$search_url/" \
  ./env.js.template > $1

nginx -g "daemon off;"