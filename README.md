# HeLx UI

This is a [React](reactjs.org/) app created with [create-react-app](https://create-react-app.dev/).

## Development

For local development you can get started with:

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
docker-compose -f docker-compose.dev.yml up -d
```

This cannot launch apps due to running in stub mode, but will allow login and
serve up some stubbed data.

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

See `.env.example` for the most up to date variables. Copy/move `.env.example`
to `.env` for local `npm run` and `docker-compose` detection.

- `REACT_APP_CONTEXT`: common | braini | catalyst | scidas | blackbalsam | restartr
- `REACT_APP_HELX_SEARCH_API_KEY`: API_KEY (not needed as of this writing)
- `REACT_APP_HELX_SEARCH_URL`: semantic search deployment to hit when executing search
- `REACT_APP_HELX_APPSTORE_URL`: host/path the app will used to get backend data
- `BUILD_PATH`: Environment variable used by `create-react-app` to determine
the react build output path

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
