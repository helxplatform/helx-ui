# HeLx UI

This is a [React](reactjs.org/) app created with [create-react-app](https://create-react-app.dev/).

## Development

For local React development you can get started with:

```bash
cp .env.sample .env
set -a && source .env && bin/populate_env public/env.json
npm install
npm start
```

NOTE: You must run `make init` once you've cloned the repo to enable the commit-msg git hook so that conventional commits will apply automatically.

### Appstore backend

### Appstore local development

Using a local installation of Appstore:

```bash
git clone https://github.com/helxplatform/appstore.git
cd appstore
cp .env.sample .env
make install
make start
```

Important: When running the UI with Workspaces locally, it expects Appstore to be available
at http://localhost:8000.


This cannot launch apps due to running in stub mode, but will allow login (with
Django admin, see details below for social login) and serve up some stubbed data.
The default user is when running Appstore locally is username: admin and password: admin.

Refer to the [Appstore repo](https://github.com/helxplatform/appstore/) for more info.

### Appstore in Kubernetes

You can install the `helx` helm chart as detailed [here](https://github.com/helxplatform/helm-charts/blob/develop/deploy-helx.md)
and port forward so that the appstore endpoints are available to your local network space.

```bash
# Port-forward Appstore to http://localhost:8000
kubectl port-forward service/helx-nginx 8000:80
```

Navigate to the site at `http://localhost:8000/`.

With this setup appstore and tycho will use your local cluster enabling full
interaction with launched app instances.

## Environment Config

HeLx-UI works by generating an `env.json` file from your environment that is used within the app.
For development purposes, you only need to generate the env.json once. Afterwards, you can modify it
directly rather than regenerating it.

See `.env.example` for the most up to date variables and appropriate default values.
- `REACT_APP_REACT_APP_WORKSPACES_ENABLED`: enables workspaces functionality (requires Appstore)
- `REACT_APP_SEMANTIC_SEARCH_ENABLED`: enables semantic search functionality
- `REACT_APP_HELX_SEARCH_URL`: points the UI to the Dug semantic search API
- `REACT_APP_UI_BRAND_NAME`: heal | braini | catalyst | scidas | eduhelx | helx
- `REACT_APP_TRANQL_ENABLED`: enables the TranQL visualization pane in search results
- `REACT_APP_TRANQL_URL`: points the UI to the TranQL deployment
- `REACT_APP_HIDDEN_SUPPORT_SECTIONS`: hides support page sections, if necessary
- `REACT_APP_DOCKSTORE_BRANCH`: used to point the UI to an alternative Dockstore branch
- `REACT_APP_APPSTORE_ASSET_BRANCH`: used to point the UI to an alternative Appstore branch to load static assets

### Generate env.json

```bash
set -a
source .env
bin/populate_env public/env.json
```

Once you've generated an env.json file, it's usually easier to just tweak the file directly
rather than running `populate_env` again.

## Appstore login configuration

Out of the box the `admin` account is configured and available for use. For
some dev this login may be enough to test changes or validate an update, but
for testing a more standard user login view/flow you will want to use one
of the social login options.

In order to use SSO login options, you'll need to be running Appstore in Kubernetes.
Refer to [this](https://wiki.renci.org/index.php?title=Kubernetes_Cloud/Helx#OAuth_Setup_for_HeLx_Authentication)
wiki article for how to setup these providers.

For UNC/Onyen SAML login, you'll need to send in a ticket to ITS requesting for them to register a SAML entity for you.
You can register a ticket [here](https://help.unc.edu/sp) by clicking Report an Issue.