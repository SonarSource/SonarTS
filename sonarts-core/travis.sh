#!/bin/bash
set -euo pipefail

cd sonarts-core
npm pack
yarn test -- --coverage
yarn license-check
cd ..
