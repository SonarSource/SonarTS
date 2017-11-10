#!/bin/bash
set -euo pipefail

cd sonarts-core
npm pack
yarn add typescript@${TS} --dev
yarn test -- --coverage
yarn license-check
cd ..
