# Developer Guidelines

## Adding a rule to the SonarQube Plugin

* Create a class in `sonar-typescript-plugin/src/main/java/...../rules` with the same name as the tslint rule-key, but camelized. For instance : `no-empty-block` becomes `NoEmptyBlock.java`
* Have the new class extend `TypeScriptRule`
* Annotate the class with `@Rule(SXXXX)`
* Override `tslintKey` and return the tslint rule-key
* If the rule provides configuration, override `configuration` as required
* Generate the rule documentation with the Rule Api and add it to `sonar-typescript-plugin/src/main/resources/...../rules/typescript`
* If the rule belongs to a default profile, add it to the relevant one(s)
* Run all tests and fix the red ones (some tests are there explicitly to check some basic mistakes when creating a new rule)