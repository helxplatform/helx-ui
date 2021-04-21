VERSION_FILE := ./package.json
VERSION      := $(shell node -p "require('./package.json').version")
DOCKER_ORG   := helxplatform
DOCKER_TAG   := helx-ui:${VERSION}
BUILD_PATH   := ./build/frontend

.DEFAULT_GOAL = help

.PHONY: build clean help install lint publish test

#help: List available tasks on this project
help:
	@grep -E '^#[a-zA-Z\.\-]+:.*$$' $(MAKEFILE_LIST) | tr -d '#' | awk 'BEGIN {FS = ": "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

#build.npm: build project with npm
build.npm:
	echo "Building distribution packages for version $(VERSION)"
	BUILD_PATH=$(BUILD_PATH) npm run build

#build.image: build project docker image
build.image:
	echo "Building docker image: $(DOCKER_TAG)"
	docker build . --no-cache --pull -t $(DOCKER_ORG)/$(DOCKER_TAG)

#build: build project and image
build: build.npm build.image

#compose.appstore: run the appstore project with docker-compose
compose.appstore:
	echo "Setup .env first ex: cp .env.example .env"
	docker-compose -f docker-compose.appstore.yml pull && docker-compose -f docker-compose.appstore.yml up --remove-orphans

#compose.ui: run the ui project with docker-compose
compose.ui:
	echo "Setup .env first ex: cp .env.example .env"
	docker-compose -f docker-compose.helxui.yml up --remove-orphans

#compose.down: stop docker-compose orchestrated containers
compose.down:
	docker-compose -f docker-compose.helxui.yml -f docker-compose.appstore.yml down --remove-orphans

#helxui.start: launch the project using react-scripts
helxui.start:
	npm run start

#install.npm: setup project dependencies
install.npm:
	npm install

#install.ci: install ci dependencies
install.ci:
	npm ci

#lint: lint the project based on settings in package.json
lint:
	npm run lint

#test: run all test https://create-react-app.dev/docs/running-tests/#continuous-integration
test: lint
	CI=true npm test

#test.interactive: run test in interactive mode, useful for development
test.interactive:
	npm run test

#publish.image: push container image to docker hub
publish.image:
	docker image push $(DOCKER_ORG)/$(DOCKER_TAG)

#publish: push all artifacts to registries
publish: publish.image

#clean: remove build artifacts and project dependencies
clean:
	rm -rf build
	rm -rf node_modules

#all: clean the project, test and create artifacts
all: clean install.npm lint test build

#reinstall: remove project artifacts/dependencies and install based on latest
reinstall: clean install.npm build.npm

#ci: orchestrates the steps to be ran for continous integration
ci: clean install.ci lint test build
