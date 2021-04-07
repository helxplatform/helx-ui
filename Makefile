VERSION_FILE := ./package.json
VERSION      := $(shell node -p "require('./package.json').version")
DOCKER_ORG   := helxplatform
DOCKER_TAG   := helx-ui:${VERSION}
BUILD_PATH   := ./build/frontend

.PHONY: build ci-install clean image install lint reinstall start test testi

all: clean install lint test build image

build:
	echo "Building distribution packages for version $(VERSION)"
	BUILD_PATH=$(BUILD_PATH) npm run build

ci: clean ci-install lint test

ci-install:
	npm ci

clean:
	rm -rf build
	rm -rf node_modules

compose:
	# setup .env first ex: cp .env.example .env 
	docker-compose -f docker-compose.helxui.yml up --remove-orphans

down:
	docker-compose -f docker-compose.helxui.yml down --remove-orphans

image:
	echo "Building docker image: $(DOCKER_TAG)"
	docker build . --no-cache --pull -t $(DOCKER_ORG)/$(DOCKER_TAG)

install:
	npm install

lint:
	npm run lint

push:
	docker image push $(DOCKER_ORG)/$(DOCKER_TAG)

reinstall: clean install build

start:
	npm run start

test:
	# https://create-react-app.dev/docs/running-tests/#continuous-integration
	# use testi for interactive
	CI=true npm test

testi:
	npm run test