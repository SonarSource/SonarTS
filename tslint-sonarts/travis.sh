#!/bin/bash
set -euo pipefail

cd tslint-sonarts
yarn build-ci
npm pack
cd ..
