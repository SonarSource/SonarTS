#!/bin/bash
set -euo pipefail

cd sonarts-core
yarn build
# run tests with the current TS version to generate test coverage
yarn test -- --coverage
# run tests with different TS versions, but the current one
yarn test-ts-versions
yarn license-check
npm pack
cd ..
