# Overview - Scripts and Commands


This is an overview of the available scripts and commands.


## Scripts
The scripts are located inside `<aio-builds-setup-dir>/scripts/`. The following scripts are
available:

- `create-image.sh`:
  Can be used for creating a preconfigured docker image.
  See [here](vm-setup--create-docker-image.md) for more info.

- `test.sh`
  Can be used for running the tests for `<aio-builds-setup-dir>/dockerbuild/scripts-js/`. This is
  useful for CI integration. See [here](misc--integrate-with-ci.md) for more info.

- `travis-preverify-pr.sh`
  Can be used for "preverifying" a PR before uploading the artifacts to the server. It checks that
  the author of the PR is a member of one of the specified GitHub teams and therefore allowed to
  upload build artifacts. This is useful for CI integration. See [here](misc--integrate-with-ci.md)
  for more info.


## Commands
The following commands are available globally from inside the docker container. They are either used
by the container to perform its various operations or can be used ad-hoc, mainly for testing
purposes. Each command is backed by a corresponding script inside
`<aio-builds-setup-dir>/dockerbuild/scripts-sh/`.

- `aio-clean-up`:
  Cleans up the builds directory by removing the artifacts that do not correspond to an open PR.
  _It is run as a daily cronjob._

- `aio-health-check`:
  Runs a basic health-check, verifying that the necessary services are running, the servers are
  responding and there is a working internet connection.
  _It is used periodically by docker for determining the container's health status._

- `aio-init`:
  Initializes the container (mainly by starting the necessary services).
  _It is run (by default) when starting the container._

- `aio-upload-server-prod`:
  Spins up a Node.js upload-server instance.
  _It is used in `aio-init` (see above) during initialization._

- `aio-upload-server-test`:
  Spins up a Node.js upload-server instance for tests.
  _It is used in `aio-verify-setup` (see below) for running tests._

- `aio-verify-setup`:
  Runs a suite of e2e-like tests, mainly verifying the correct (inter)operation of nginx and the
  Node.js upload-server.
