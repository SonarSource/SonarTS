#!/bin/bash

#install npm
node_home=node-v8.9.0-win-x64
if [ ! -d "$node_home" ]; then
  echo "=== Install Node.js ===";
  wget --no-check-certificate -O node.zip https://nodejs.org/dist/v8.9.0/node-v8.9.0-win-x64.zip;
  unzip node.zip;
  rm node.zip;
fi

chmod 755 $node_home/node;

export PATH=$node_home:$PATH;

echo "Node version"
node -v

#install yarn
echo "=== Install yarn ===";
npm install -g yarn;
echo "Yarn version :"
yarn -v;
