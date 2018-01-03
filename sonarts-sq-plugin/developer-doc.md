# Developer Guidelines

## Adding a rule to sonarts-core
* Follow instructions [here](../CONTRIBUTING.md) or run `new-rule` tool
```
# from project root
java -jar <location of rule-api jar> generate -rule S1234 -no-language-in-filenames
cd sonarts-core
yarn new-rule S1234 noSomethingSomewhereRule 
```
 
## Adding a rule to the SonarQube Plugin

* Create a class in `sonar-typescript-plugin/src/main/java/...../rules` with the same name as the tslint rule-key, but camelized. For instance : `no-empty-block` becomes `NoEmptyBlock.java`
* Have the new class extend `TypeScriptRule`
* Annotate the class with `@Rule(SXXXX)`
* Override `tslintKey` and return the tslint rule-key
* If the rule provides configuration, override `configuration` as required
* Generate the rule documentation with the Rule Api and add it to `sonar-typescript-plugin/src/main/resources/...../rules/typescript`
* If the rule belongs to a default profile, add it to the relevant one(s)
* Add rule class to `TypeScriptRules.getRuleClasses()`
* Run all tests and fix the red ones (some tests are there explicitly to check some basic mistakes when creating a new rule)
* On RSPEC page of the rule fill `Tools` -> `TSLint-SonarTS` or `TSLint` with the tslint rule-key (use first one if the rule is part of tslint-sonarts)

## Releasing

### 1 - Releasing tslint-sonarts npm package
* login to npm with `npm adduser`
* create new branch, e.g. `1.2.0`, add upstream
* run this to publish package
```
cd sonarts-core
yarn build
np --any-branch
```
* run `./build.sh` from project root
* commit changes of `sonarts-sq-plugin/sonar-typescript-plugin/sonarts-bundle/package-lock.json` and `sonarts-sq-plugin/sonar-typescript-plugin/sonarts-bundle/package.json`
* create PR from this branch
* merge it

### 2 - Releasing SonarTS SQ plugin
* perform release of SQ plugin as usual (one click-release from burgr)
* Prepare for next iteration (bump version of maven) and update version in sonar-project.properties
* create GitHub release for the tag of this SQ release
* tweet something!:)


