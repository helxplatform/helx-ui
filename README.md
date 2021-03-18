# HeLx UI

This is a [React](reactjs.org/) app created with [create-react-app](https://create-react-app.dev/).

## Development

For local React development you can get started with:

```bash
$ npm start
```

### Appstore backend

To use the `appstore` as a local backend you will need to have minikube installed
and optionally `docker-compose`. For simple setups `docker-compose` is enough to
run the appstore and provide endpoints for development. For more advance capabilities
it is helpful to run the appstore in minikube with port forwarding so that service
endpoints will start and stop services in your local minikube environment.

### Appstore docker-compose

Make sure you have minikube installed then:

```bash
cp .env.example .env
docker-compose -f docker-compose.dev.yml up -d
```

Optionally

```bash
vim .env
```

This cannot launch apps due to running in stub mode, but will allow login (with
Django admin, see details below for social login) and serve up some stubbed data.

### Appstore local kubernetes

Using a local kubernetes environment (kind, minikube, k3) you can install the
`appstore` helm chart as detailed [here](https://github.com/helxplatform/appstore/tree/alexander/react-build/appstore#development-environment-with-kubernetes)
and port forward so that the appstore endpoints are available to your local
network space.

```bash
kubectl port-forward service/helx-nginx 8080:80
```

Navigate to endpoints at `http://localhost:8080/`.

With this setup appstore and tycho will use your local cluster enabling full
interaction with launched app instances.

## Environment Variables

### React

See `.env.example` for the most up to date variables. Copy/move `.env.example`
to `.env` for local `npm run` and `docker-compose` detection.

- `REACT_APP_CONTEXT`: common | braini | catalyst | scidas | blackbalsam | restartr
- `REACT_APP_HELX_SEARCH_API_KEY`: API_KEY (not needed as of this writing)
- `REACT_APP_HELX_SEARCH_URL`: semantic search deployment to hit when executing search
- `REACT_APP_HELX_APPSTORE_URL`: host/path the app will used to get backend data
- `BUILD_PATH`: Environment variable used by `create-react-app` to determine
the react build output path

### Appstore

The following variables control the appstore backend configuration. Defaults are
provided in `env.sample` with the exception of github login variables. These are
a minimum set that should provide ease of use and functionality for frontend
development without needing to understand all appstore environment variables
and configuration.

- `WHITELIST_REDIRECT`: prevents Django from performing a redirect for unauthorized
(not unauthenticated) users and instead raises a 403 that React can handle.
- `DEV_PHASE`: defaults to `stub` providing sample data and doesn't rely on Tycho
talking to Kubernetes
- `DEBUG`: handles how Django routes/raises on error and the amount of detail provided
- `ALLOW_DJANGO_LOGIN`: toggle Django login as a provider, doesn't impact admin login
- `OAUTH_PROVIDERS`: list of oauth login providers
- `GITHUB_NAME`: app name you configured for your github oauth app
- `GITHUB_CLIENT_ID`: github generated client id
- `GITHUB_SECRET`: github generated client secret
- `AUTHORIZED_USERS`: your primary github email
- `NAMESPACE`: optional, not required in stub mode, most likely `default` for
local dev. This is the kubernetes namespace Tycho will start services in.

For more details on the appstore variables please see the appstore [README](https://github.com/helxplatform/appstore/tree/develop/appstore#app-development).

## Appstore login configuration

Out of the box the `admin` account is configured and available for use. For
some dev this login may be enough to test changes or validate an update, but
for testing a more standard user login view/flow you will want to use one
of the social login options.

The following steps describe setting up github social login for use with the
appstore backend. This is probably the easiest login provider to setup for local
testing.

- Login to GitHub
- Setup a GitHub OAuth [app](https://docs.github.com/en/developers/apps/creating-an-oauth-app)

> You can use 127.0.0.1, localhost or 0.0.0.0 here, but it needs to match the
> address you use locally these are not interchangeable. Mixing them will raise
> a callback error in the login flow.

- Copy `.env.example` to `.env`
- Add your app name, secret and id to the GITHUB_* variables
- Add your github email to `AUTHORIZED_USERS` so that your user can login, and
your user will be authorized to access appstore resources.
- If you have already started appstore restart it
  - If running in `docker-compose` you shouldn't need to do anything more that restart
  - If running appstore locally you will need to remove the generated sqlite database
and makes sure to rerun the `start` command or use the `manageauthorizedusers` command.
- appstore login should now be configured to support github social authentication
and your user has been added as an authorized user.

For more details please reference the devops [README](https://github.com/helxplatform/devops/tree/develop#configure-environment-variables-for-helx-deployment)
and check the section on OAuth login.

## Production build configuration

For local development the app talks to the appstore as a seperate entity. In an
appstore deployment environment the appstore facilitates serving the frontend.
The main impact this has on the frontend repo is the `homepage` field in
`package.json` and `BUILD_PATH` in `.env`. Both of these are used to configure
build settings with react and webpack.

[Controlling asset reference path](https://create-react-app.dev/docs/deployment/#building-for-relative-paths)
[React configuration variables](https://create-react-app.dev/docs/advanced-configuration/)

In `appstore` the frontend app is served from a `static/frontend` directory,
not the server root as react assumes by default. While these settings assist in
deploying the frontend app they can be used in the frontend repo along with
`npm run start` without requiring additional configuration in this project.
