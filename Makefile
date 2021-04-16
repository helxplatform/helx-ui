VERSION_FILE := ./package.json
VERSION      := $(shell node -p "require('./package.json').version")
DOCKER_ORG   := helxplatform
DOCKER_TAG   := helx-ui:${VERSION}
BUILD_PATH   := ./build/frontend

.DEFAULT_GOAL = help

.PHONY: build ci-install clean image install lint reinstall start test testi

#help: List available tasks on this project
help:
	@grep -E '^#[a-zA-Z\.\-]+:.*$$' $(MAKEFILE_LIST) | tr -d '#' | awk 'BEGIN {FS = ": "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

#all: clean the project, test and create artifacts
all: clean install lint test build image

#build: build project with npm
build:
	echo "Building distribution packages for version $(VERSION)"
	BUILD_PATH=$(BUILD_PATH) npm run build

#ci: orchestrates the steps to be ran for continous integration
ci: clean ci-install lint test

#ci-install: install ci dependencies
ci-install:
	npm ci

#clean: remove build artifacts and project dependencies
clean:
	rm -rf build
	rm -rf node_modules

#compose: run the project with docker-compose
compose:
	echo "Setup .env first ex: cp .env.example .env"
	docker-compose -f docker-compose.appstore.yml pull && docker-compose -f docker-compose.appstore.yml up --remove-orphans

#down: stop docker-compose orchestrated containers
down:
	docker-compose -f docker-compose.appstore.yml down --remove-orphans

#image: build project docker image
image:
	echo "Building docker image: $(DOCKER_TAG)"
	docker build . --no-cache --pull -t $(DOCKER_ORG)/$(DOCKER_TAG)

#install: setup project dependencies
install:
	npm install

#lint: lint the project based on settings in package.json
lint:
	npm run lint

#push: push container image to docker hub
push:
	docker image push $(DOCKER_ORG)/$(DOCKER_TAG)

#reinstall: remove project artifacts/dependencies and install based on latest
reinstall: clean install build

#start: launch the project using react-scripts
start:
	npm run start

#test: run all test
test:
	# https://create-react-app.dev/docs/running-tests/#continuous-integration
	# use testi for interactive
	CI=true npm test

#testi: run test in interactive mode, useful for development
testi:
	npm run test