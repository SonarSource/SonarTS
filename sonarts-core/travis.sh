#!/bin/bash
set -euo pipefail

cd sonarts-core
yarn build
yarn test -- --coverage
node scripts/analyse.js
yarn license-check
npm pack
cd ..