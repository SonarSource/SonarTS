#!/bin/bash
set -eou pipefail

cd sonarts-core

rm -f tslint-sonarts-*.tgz
yarn test
npm pack

cd ..

cd sonarts-sq-plugin

cd sonar-typescript-plugin/sonarts-bundle
npm install ../../../sonarts-core/tslint-sonarts-*.tgz
rm ../../../sonarts-core/tslint-sonarts-*.tgz
cd ../../

mvn clean install -B -e -V

cd ..

