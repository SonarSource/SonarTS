#!/bin/bash
# Regular way to build a SonarSource Maven project on Travis.
# Requires the environment variables:
# - SONAR_HOST_URL: URL of SonarQube server
# - SONAR_TOKEN: access token to send analysis reports to $SONAR_HOST_URL
# - GITHUB_TOKEN: access token to send analysis of pull requests to GibHub
# - ARTIFACTORY_URL: URL to Artifactory repository
# - ARTIFACTORY_DEPLOY_REPO: name of deployment repository
# - ARTIFACTORY_DEPLOY_USERNAME: login to deploy to $ARTIFACTORY_DEPLOY_REPO
# - ARTIFACTORY_DEPLOY_PASSWORD: password to deploy to $ARTIFACTORY_DEPLOY_REPO

# deploy and analyze only on one axes of node versions
if [[ ${ANALYZE} == "false" ]]; then
  echo "Analysis was not requested on this axis"
  exit 0
fi

set -euo pipefail

#install maven
function configureTravis {
  mkdir -p ~/.local
  curl -sSL https://github.com/SonarSource/travis-utils/tarball/v55 | tar zx --strip-components 1 -C ~/.local
  source ~/.local/bin/install
}

configureTravis
. ~/.local/bin/installMaven35

#install sonar-scanner
pushd ~ > /dev/null
if [ ! -d "sonar-scanner-3.3.0.1492/bin" ]; then
  wget -O sonar-scanner.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-3.3.0.1492.zip
  unzip sonar-scanner.zip
  rm sonar-scanner.zip
fi
export PATH=$PATH:~/sonar-scanner-3.3.0.1492/bin
popd > /dev/null


if [ "${TRAVIS_BRANCH}" == "master" ] && [ "$TRAVIS_PULL_REQUEST" == "false" ]; then
  echo '======= Build, deploy and analyze master'

  # Fetch all commit history so that SonarQube has exact blame information
  # for issue auto-assignment
  # This command can fail with "fatal: --unshallow on a complete repository does not make sense" 
  # if there are not enough commits in the Git repository (even if Travis executed git clone --depth 50).
  # For this reason errors are ignored with "|| true"
  git fetch --unshallow || true
  
  cd sonarts-sq-plugin
  export MAVEN_OPTS="-Xmx1536m -Xms128m"

  . set_maven_build_version $TRAVIS_BUILD_NUMBER
  mvn deploy \
      -Pcoverage,deploy-sonarsource,release \
      -Dmaven.test.redirectTestOutputToFile=false \
      -B -e -V $*
  cd ..

  sonar-scanner \
      -Dsonar.host.url=$SONAR_HOST_URL \
      -Dsonar.login=$SONAR_TOKEN \
      -Dsonar.analysis.buildNumber=$TRAVIS_BUILD_NUMBER \
      -Dsonar.analysis.pipeline=$TRAVIS_BUILD_NUMBER \
      -Dsonar.analysis.sha1=$TRAVIS_COMMIT  \
      -Dsonar.analysis.repository=$TRAVIS_REPO_SLUG

elif [[ "${TRAVIS_BRANCH}" == "branch-"* ]] && [ "$TRAVIS_PULL_REQUEST" == "false" ]; then
  # analyze maintenance branches as long-living branches

  # Fetch all commit history so that SonarQube has exact blame information
  # for issue auto-assignment
  # This command can fail with "fatal: --unshallow on a complete repository does not make sense" 
  # if there are not enough commits in the Git repository (even if Travis executed git clone --depth 50).
  # For this reason errors are ignored with "|| true"
  git fetch --unshallow || true

  export MAVEN_OPTS="-Xmx1536m -Xms128m" 
  
  echo "======= Found SNAPSHOT version ======="
  cd sonarts-sq-plugin
  # Do not deploy a SNAPSHOT version but the release version related to this build
  . set_maven_build_version $TRAVIS_BUILD_NUMBER

  mvn deploy \
    -Pcoverage,deploy-sonarsource,release \
    -B -e -V $*
  cd ..

  sonar-scanner \
      -Dsonar.host.url=$SONAR_HOST_URL \
      -Dsonar.login=$SONAR_TOKEN \
      -Dsonar.branch.name=$TRAVIS_BRANCH \
      -Dsonar.analysis.buildNumber=$TRAVIS_BUILD_NUMBER \
      -Dsonar.analysis.pipeline=$TRAVIS_BUILD_NUMBER \
      -Dsonar.analysis.sha1=$TRAVIS_COMMIT  \
      -Dsonar.analysis.repository=$TRAVIS_REPO_SLUG

elif [ "$TRAVIS_PULL_REQUEST" != "false" ] && [ -n "${GITHUB_TOKEN:-}" ]; then
  echo '======= Build and analyze pull request'

  # Fetch all commit history so that SonarQube has exact blame information
  # for issue auto-assignment
  # This command can fail with "fatal: --unshallow on a complete repository does not make sense" 
  # if there are not enough commits in the Git repository (even if Travis executed git clone --depth 50).
  # For this reason errors are ignored with "|| true"
  git fetch --unshallow || true

  export MAVEN_OPTS="-Xmx1G -Xms128m"

  echo '======= with deploy'
  cd sonarts-sq-plugin

  # Do not deploy a SNAPSHOT version but the release version related to this build and PR
  . set_maven_build_version $TRAVIS_BUILD_NUMBER

  mvn deploy \
    -Pcoverage,deploy-sonarsource \
    -Dmaven.test.redirectTestOutputToFile=false \
    -B -e -V $*
  cd ..

  sonar-scanner \
    -Dsonar.host.url=$SONAR_HOST_URL \
    -Dsonar.login=$SONAR_TOKEN \
    -Dsonar.pullrequest.branch=$TRAVIS_PULL_REQUEST_BRANCH \
    -Dsonar.pullrequest.base=$TRAVIS_BRANCH \
    -Dsonar.analysis.buildNumber=$TRAVIS_BUILD_NUMBER \
    -Dsonar.analysis.pipeline=$TRAVIS_BUILD_NUMBER \
    -Dsonar.analysis.sha1=$TRAVIS_PULL_REQUEST_SHA \
    -Dsonar.analysis.repository=$TRAVIS_REPO_SLUG \
    -Dsonar.analysis.prNumber=$TRAVIS_PULL_REQUEST \
    -Dsonar.pullrequest.key=$TRAVIS_PULL_REQUEST

elif [[ "$TRAVIS_BRANCH" == "dogfood-on-"* ]] && [ "$TRAVIS_PULL_REQUEST" == "false" ]; then
  echo '======= Build dogfood branch'
  cd sonarts-sq-plugin

    # get current version from pom
  CURRENT_VERSION=`maven_expression "project.version"`

  . set_maven_build_version $TRAVIS_BUILD_NUMBER  

  mvn deploy \
    -Pdeploy-sonarsource,release \
    -B -e -V $*    

else
  echo '======= Build, no analysis, no deploy'

  # No need for Maven phase "install" as the generated JAR files do not need to be installed
  # in Maven local repository. Phase "verify" is enough.

  cd sonarts-sq-plugin
  mvn verify \
      -Dmaven.test.redirectTestOutputToFile=false \
      -B -e -V $*
  cd ..
fi
