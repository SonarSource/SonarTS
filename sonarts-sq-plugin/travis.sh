#!/bin/bash

set -euo pipefail

cd sonarts-sq-plugin

function configureTravis {
  mkdir -p ~/.local
  curl -sSL https://github.com/SonarSource/travis-utils/tarball/v55 | tar zx --strip-components 1 -C ~/.local
  source ~/.local/bin/install
}
configureTravis
. ~/.local/bin/installMaven35

cd sonar-typescript-plugin/sonarts-bundle
npm install ../../../sonarts-core/tslint-sonarts-*.tgz
cd ../../

# save dependencies for future SQ analysis of Java code
mvn dependency:copy-dependencies -DoutputDirectory=dependencies

cd ..
