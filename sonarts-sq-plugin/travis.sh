#!/bin/bash

set -euo pipefail

cd sonarts-sq-plugin

function configureTravis {
  mkdir -p ~/.local
  curl -sSL https://github.com/SonarSource/travis-utils/tarball/v36 | tar zx --strip-components 1 -C ~/.local
  source ~/.local/bin/install
}
configureTravis

cd sonar-typescript-plugin/sonarts-core
npm install ../../../sonarts-core/tslint-sonarts-*.tgz
cd ../../

export DEPLOY_PULL_REQUEST=true
regular_mvn_build_deploy_analyze

cd ..
