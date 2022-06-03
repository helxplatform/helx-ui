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
tranql_enabled="${REACT_APP_TRANQL_ENABLED:-false}"
tranql_url="${REACT_APP_TRANQL_URL:-\/tranql}"
analytics="${REACT_APP_ANALYTICS:-}"
hidden_support_sections="${REACT_APP_HIDDEN_SUPPORT_SECTIONS}"
deployment_namespace="${REACT_APP_DEPLOYMENT_NAMESPACE}"


template='{
    "brand": "%BRAND%",
    "color_scheme": { "primary": "#8a5a91", "secondary": "#505057" },
    "search_url": "%SEARCH_URL%",
    "search_enabled": "%SEARCH_ENABLED%",
    "workspaces_enabled": "%WORKSPACES_ENABLED%",
    "tranql_enabled": "%TRANQL_ENABLED%",
    "tranql_url": "%TRANQL_URL%",
    "analytics": {
      "enabled": true,
      "platform": "mixpanel",
      "auth": {
      "mixpanel_token": "%ANALYTICS%",
      "ga_property": ""
      }
    },
    "hidden_support_sections": "%HIDDEN_SUPPORT_SECTIONS%",
    "deployment_namespace": "%DEPLOYMENT_NAMESPACE%"
}'

echo $template | sed \
  -e "s/%WORKSPACES_ENABLED%/$workspaces_enabled/" \
  -e "s/%SEARCH_ENABLED%/$search_enabled/" \
  -e "s/%SEARCH_URL%/$search_url/" \
  -e "s/%BRAND%/$brand_name/" \
  -e "s/%HIDDEN_SUPPORT_SECTIONS%/$hidden_support_sections/" \
  -e "s/%ANALYTICS%/$analytics/" \
  -e "s/%TRANQL_ENABLED%/$tranql_enabled/" \
  -e "s/%TRANQL_URL%/$tranql_url/" \
  -e "s/%DEPLOYMENT_NAMESPACE%/$deployment_namespace/" \
  > $1