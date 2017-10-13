#!/bin/bash
cd sonarts-core
yarn build
yarn test -- --coverage
yarn license-check
npm pack
cd ..