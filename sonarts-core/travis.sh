#!/bin/bash
cd sonarts-core
yarn build
yarn test -- --coverage
node scripts/analyse.js
# yarn ruling
yarn license-check
npm pack
cd ..