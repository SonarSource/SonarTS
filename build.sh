#!/bin/bash
set -eou pipefail

cd tslint-sonarts

rm -f tslint-sonarts-*.tgz
yarn build-local
npm pack

cd ..

cd sonarts-sq-plugin

cd sonar-typescript-plugin/sonarts-bundle
npm install ../../../tslint-sonarts/tslint-sonarts-*.tgz
rm ../../../tslint-sonarts/tslint-sonarts-*.tgz
cd ../../

mvn clean install -B -e -V

cd ..

