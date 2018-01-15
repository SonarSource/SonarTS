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
if [ "${TRAVIS_NODE_VERSION}" != "8" ]; then
  exit 0
fi

set -euo pipefail

#install maven
function configureTravis {
  mkdir -p ~/.local
  curl -sSL https://github.com/SonarSource/travis-utils/tarball/v42 | tar zx --strip-components 1 -C ~/.local
  source ~/.local/bin/install
}

configureTravis
. ~/.local/bin/installMaven35

#install sonar-scanner
pushd ~ > /dev/null
if [ ! -d "sonar-scanner-3.0.3.778-linux/bin" ]; then
  wget -O sonar-scanner.zip https://sonarsource.bintray.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-3.0.3.778-linux.zip
  unzip sonar-scanner.zip
  rm sonar-scanner.zip
fi
export PATH=$PATH:~/sonar-scanner-3.0.3.778-linux/bin
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
  mvn org.jacoco:jacoco-maven-plugin:prepare-agent deploy \
      -Pcoverage-per-test,deploy-sonarsource,release \
      -Dmaven.test.redirectTestOutputToFile=false \
      -B -e -V $*
  cd ..

  sonar-scanner \
      -Dsonar.host.url=$SONAR_HOST_URL \
      -Dsonar.login=$SONAR_TOKEN \
      -Dsonar.analysis.buildNumber=$TRAVIS_BUILD_NUMBER \
      -Dsonar.analysis.pipeline=$TRAVIS_BUILD_NUMBER \
      -Dsonar.analysis.sha1=$TRAVIS_COMMIT  \
      -Dsonar.analysis.repository=$TRAVIS_REPO_SLUG \

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

  mvn org.jacoco:jacoco-maven-plugin:prepare-agent deploy \
    -Pdeploy-sonarsource,release \
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

  mvn org.jacoco:jacoco-maven-plugin:prepare-agent deploy \
    -Pdeploy-sonarsource \
    -Dmaven.test.redirectTestOutputToFile=false \
    -B -e -V $*
  cd ..

  sonar-scanner \
    -Dsonar.host.url=$SONAR_HOST_URL \
    -Dsonar.login=$SONAR_TOKEN \
    -Dsonar.branch.name=$TRAVIS_PULL_REQUEST_BRANCH \
    -Dsonar.branch.target=$TRAVIS_BRANCH \
    -Dsonar.analysis.buildNumber=$TRAVIS_BUILD_NUMBER \
    -Dsonar.analysis.pipeline=$TRAVIS_BUILD_NUMBER \
    -Dsonar.analysis.sha1=$TRAVIS_PULL_REQUEST_SHA \
    -Dsonar.analysis.repository=$TRAVIS_REPO_SLUG \
    -Dsonar.analysis.prNumber=$TRAVIS_PULL_REQUEST \
    -Dsonar.pullrequest.github.id=$TRAVIS_PULL_REQUEST \
    -Dsonar.pullrequest.github.repository=$TRAVIS_REPO_SLUG

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
