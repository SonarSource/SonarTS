#!/bin/bash
set -eou pipefail

cd sonarts-core

rm -f tslint-sonarts-*.tgz
yarn build-local
npm pack

cd ..

cd sonarts-sq-plugin

cd sonar-typescript-plugin/sonarts-bundle
npm install ../../../sonarts-core/tslint-sonarts-*.tgz
rm ../../../sonarts-core/tslint-sonarts-*.tgz
cd ../../

mvn_command="mvn"
if [[ $OSTYPE == "msys"  || $OSTYPE == "cygwin" ]]; then
  mvn_command="mvn.cmd"
fi

${mvn_command} clean install -B -e -V -Dmaven.test.redirectTestOutputToFile=true

cd ..

