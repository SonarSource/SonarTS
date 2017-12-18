#!/bin/bash
set -euo pipefail

cd sonarts-core
yarn build
# type check tests only, `src` is checked during `yarn build`
yarn type-check tests
yarn test -- --coverage
yarn license-check
npm pack
cd ..
