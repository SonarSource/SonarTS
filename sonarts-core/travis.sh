#!/bin/bash
set -euo pipefail

cd sonarts-core
yarn build
yarn test -- --coverage
yarn license-check
npm pack
cd ..