#!/usr/bin/env groovy

@Library('SonarSource@2.1.2') _

pipeline {
  agent {
    label 'linux'
  }
  parameters {
    string(name: 'GIT_SHA1', description: 'Git SHA1 (provided by travisci hook job)')
    string(name: 'CI_BUILD_NAME', defaultValue: 'sonar-security', description: 'Build Name (provided by travisci hook job)')
    string(name: 'CI_BUILD_NUMBER', description: 'Build Number (provided by travisci hook job)')
    string(name: 'GITHUB_BRANCH', defaultValue: 'master', description: 'Git branch (provided by travisci hook job)')
    string(name: 'GITHUB_REPOSITORY_OWNER', defaultValue: 'SonarSource', description: 'Github repository owner(provided by travisci hook job)')
  }
  environment {
    SONARSOURCE_QA = 'true'
    MAVEN_TOOL = 'Maven 3.5.x'
    JDK_VERSION = 'Java 11'
  }
  stages {
    stage('Notify') {
      steps {
        sendAllNotificationQaStarted()
      }
    }
    stage('QA') {
      parallel {
        stage('plugin-SQ[DOGFOOD]') {
          agent {
            label 'linux'
          }
          steps {
            runIts("plugin", "DOGFOOD", JDK_VERSION)
          }
        }
        stage('plugin-SQ[LATEST_RELEASE]') {
          agent {
            label 'linux'
          }
          steps {
            runIts("plugin", "LATEST_RELEASE", JDK_VERSION)
          }
        }
        stage('plugin-SQ[LATEST_RELEASE]-win') {
          agent {
            label 'windows'
          }
          steps {
            runIts("plugin", "LATEST_RELEASE", JDK_VERSION)
          }
        }
        stage('plugin-SQ[LATEST_RELEASE_7.9]') {
          agent {
            label 'linux'
          }
          steps {
            runIts("plugin", "LATEST_RELEASE[7.9]", JDK_VERSION)
          }
        }
        stage('ruling') {
          agent {
            label 'multicpu'
          }
          steps {
            // install yarn
            nodejs(configId: 'npm-artifactory', nodeJSInstallationName: 'NodeJS latest') {
              sh "npm install -g yarn"
              sh "git submodule update --init --recursive"
              dir("sonarts-core") {
                sh "yarn && yarn ruling"
              }
            }
          }
        }
        stage('ci-win') {
          agent {
            label 'windows'
          }
          steps {
            configureRuntimes(JDK_VERSION) {
              sh "npm install -g yarn"
              sh "SONARSOURCE_QA=false ./build.sh"
            }
          }
        }
      }
      post {
        always {
          sendAllNotificationQaResult()
        }
      }
    }
    stage('Promote') {
      steps {
        repoxPromoteBuild()
      }
      post {
        always {
          sendAllNotificationPromote()
        }
      }
    }
  }
}

def withQAEnv(def body) {
  withCredentials([string(credentialsId: 'ARTIFACTORY_PRIVATE_API_KEY', variable: 'ARTIFACTORY_API_KEY')]) {
    body.call()
  }
}

def withJava(jdk, def body) {
  def javaHome = tool name: jdk, type: 'hudson.model.JDK'
  withEnv(["JAVA_HOME=${javaHome}"]) {
    body.call()
  }
}

def configureRuntimes(jdk, def body) {
  withQAEnv {
    nodejs(configId: 'npm-artifactory', nodeJSInstallationName: 'NodeJS latest') {
      withJava(jdk) {
        withMaven(maven: MAVEN_TOOL) {
          body.call()
        }
      }
    }
  }
}

def runIts(test, sqVersion, jdk) {
  configureRuntimes(jdk) {
    dir("sonarts-sq-plugin") {
      mavenSetBuildVersion()
      def mvnCommand = isUnix() ? 'mvn' : 'mvn.cmd'
      dir("its/$test") {
        sh "$mvnCommand -B -e -V -Dsonar.runtimeVersion=\"$sqVersion\" -Dmaven.test.redirectTestOutputToFile=false -Dorchestrator.artifactory.apiKey=${env.ARTIFACTORY_API_KEY} -Dorchestrator.configUrl=${env.ARTIFACTORY_URL}/orchestrator.properties/orch-h2.properties clean verify"
      }
    }
  }
}

