#!/bin/bash

cd sonarts-core

yarn build
yarn test
yarn license-check
npm pack

cd ..

cd sonarts-sq-plugin

cd sonar-typescript-plugin/sonarts-core
npm install ../../../sonarts-core/tslint-sonarts-*.tgz
cd ../../

mvn clean install -B -e -V

cd ..

