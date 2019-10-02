#!/bin/bash
set -eou pipefail

cd sonarts-sq-plugin

mvn_command="mvn"
if [[ $OSTYPE == "msys"  || $OSTYPE == "cygwin" ]]; then
  mvn_command="mvn.cmd"
fi

${mvn_command} clean install -B -e -V -Dmaven.test.redirectTestOutputToFile=true

cd ..

