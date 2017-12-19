#!/bin/bash
set -euo pipefail

cd sonarts-core
yarn build-ci
npm pack
cd ..
