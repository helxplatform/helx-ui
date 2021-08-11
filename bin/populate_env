#!/usr/bin/env bash

if [ -z "$1" ]
  then
    echo "Usage: populate_env /path/to/output/env.json"
    exit 1
fi

workspaces_enabled="${REACT_APP_WORKSPACES_ENABLED:-true}"
search_enabled="${REACT_APP_SEMANTIC_SEARCH_ENABLED:-true}"
search_url="${REACT_APP_HELX_SEARCH_URL}"
brand_name="${REACT_APP_UI_BRAND_NAME}"

template='{
    "brand": "%BRAND%",
    "color_scheme": { "primary": "#8a5a91", "secondary": "#505057" },
    "search_url": "%SEARCH_URL%",
    "search_enabled": "%SEARCH_ENABLED%",
    "workspaces_enabled": "%WORKSPACES_ENABLED%"
}'

echo $template | sed \
  -e "s/%WORKSPACES_ENABLED%/$workspaces_enabled/" \
  -e "s/%SEARCH_ENABLED%/$search_enabled/" \
  -e "s/%SEARCH_URL%/$search_url/" \
  -e "s/%BRAND%/$brand_name/" \
  > $1