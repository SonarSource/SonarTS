#!/bin/bash
set -eou

#install npm
node_home=$(pwd)/node-v8.9.0-win-x64
node_archive=node.7z
if [ ! -d "$node_home" ]; then
  echo "=== Install Node.js ===";
  curl --insecure --silent --show-error -o $node_archive https://nodejs.org/dist/v8.9.0/node-v8.9.0-win-x64.7z;
  7z x $node_archive;
  rm $node_archive;
fi

chmod 755 $node_home/node;

export PATH=$node_home:$PATH;

echo "Node version"
node -v

#install yarn
echo "=== Install yarn ===";
npm install -g yarn;

yarn -v

cd sonarts-core

yarn build
yarn test
yarn license-check
npm pack

cd ..

cd sonarts-sq-plugin

cd sonar-typescript-plugin/sonarts-bundle
npm install ../../../sonarts-core/tslint-sonarts-*.tgz
cd ../../

mvn clean install -B -e -V

cd ..

