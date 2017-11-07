#!/bin/bash
set -euo pipefail
echo "Running $TEST with SQ=$SQ_VERSION"

case "$TEST" in
  ci)
  ./build.sh
  exit 0;
  ;;

  plugin)
  cd sonarts-sq-plugin/its/plugin
  mvn -B -e -Dsonar.runtimeVersion="$SQ_VERSION" -Dmaven.test.redirectTestOutputToFile=false package
  ;;

  ruling)
  cd sonarts-sq-plugin/its/ruling
  mvn -B -e package
  ;;

  *)
  echo "Unexpected TEST mode: $TEST"
  exit 1
  ;;
esac

