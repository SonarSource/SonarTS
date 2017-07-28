# SonarTS [![Build Status](https://travis-ci.org/SonarSource/SonarTS.svg?branch=master)](https://travis-ci.org/SonarSource/SonarTS) [![NPM version](https://badge.fury.io/js/tslint-sonarts.svg)](http://badge.fury.io/js/tslint-sonarts)
SonarSource's code analyzer for TypeScript.

Currently available as a [TSLint](https://github.com/palantir/tslint) plugin.

## Rules

* Collection sizes and array length comparisons should make sense ([`no-collection-size-mischeck`]) ([`requires type-check`])
* All branches in a conditional structure should not have exactly the same implementation ([`no-all-duplicated-branches`])
* Two branches in a conditional structure should not have exactly the same implementation ([`no-duplicated-branches`])
* Destructuring patterns should not be empty ([`no-empty-destructuring`])
* Related "if/else if" statements and "cases" in a "switch" should not have the same condition ([`no-identical-conditions`])
* Identical expressions should not be used on both sides of a binary operator ([`no-identical-expressions`])
* Return values should not be ignored when function calls don't have any side effects ([`no-ignored-return`]) ([`requires type-check`])
* The output of functions that don't return anything should not be used ([`no-use-of-empty-return-value`]) ([`requires type-check`])
* Variables should be declared before they are used ([`no-variable-usage-before-declaration`]) ([`requires type-check`])
* Variables should not be self-assigned ([`no-self-assignment`])
* Non-existent operators '=+', '=-' and '=!' should not be used ([`no-misspelled-operator`])
* Functions should use "return" consistently ([`no-inconsistent-return`])
* Values should not be uselessly incremented ([`no-useless-increment`])
* Jump statements should not be used unconditionally ([`no-unconditional-jump`])
* `Array.reverse` should not be used misleadingly ([`no-misleading-array-reverse`])

[`no-collection-size-mischeck`]: ./docs/rules/no-collection-size-mischeck.md
[`no-all-duplicated-branches`]: ./docs/rules/no-all-duplicated-branches.md
[`no-duplicated-branches`]: ./docs/rules/no-duplicated-branches.md
[`no-empty-destructuring`]: ./docs/rules/no-empty-destructuring.md
[`no-identical-conditions`]: ./docs/rules/no-identical-conditions.md
[`no-identical-expressions`]: ./docs/rules/no-identical-expressions.md
[`no-ignored-return`]: ./docs/rules/no-ignored-return.md
[`no-use-of-empty-return-value`]: ./docs/rules/no-use-of-empty-return-value.md
[`no-variable-usage-before-declaration`]: ./docs/rules/no-variable-usage-before-declaration.md
[`no-self-assignment`]: ./docs/rules/no-self-assignment.md
[`no-misspelled-operator`]: ./docs/rules/no-misspelled-operator.md
[`no-inconsistent-return`]: ./docs/rules/no-inconsistent-return.md
[`no-useless-increment`]: ./docs/rules/no-useless-increment.md
[`no-unconditional-jump`]: ./docs/rules/no-unconditional-jump.md
[`no-misleading-array-reverse`]: ./docs/rules/no-misleading-array-reverse.md

[`requires type-check`]: https://palantir.github.io/tslint/usage/type-checking/

## Installation
* If you don't have TSLint yet configured for your project follow [these instructions](https://github.com/palantir/tslint#installation--usage).
* Install `tslint-sonarts`
```sh
npm install tslint-sonarts      # install in your project
npm install tslint-sonarts -g   # or install globally
```

* Add `tslint-sonarts` to your `tslint.json` `extends` property:
```javascript
{
  "extends": ["tslint:recommended", "tslint-sonarts"]
}
```
* Some of the rules in SonarTS require type information. So in order to provide as much value as possible run TSLint with **type-checker**, for example:
```
tslint --type-check --project tsconfig.json -c tslint.json 'src/**/*.ts'
```

## Contribution

### Create New Rule

* Create file for rule implementation in `src/rules`. File name should start with lower case and have suffix `Rule`
* Create test folder in `test/rules` with the name of the rule file
* In this folder create files `<rule file name>.test.ts` and `<rule file name>.lint.ts`
* Run [Ruling](#ruling) test
* Add rule key to `tslint-sonarts.json`
* In folder `docs/rules` create rule documentation file `<rule key>.md`
* In `README.md` add reference to the documentation file.

### Testing

The awesome [jest](http://facebook.github.io/jest/) test runner is used. There is just a 
[little configuration](https://github.com/SonarSource/SonarTS/blob/master/jest.config.js) required 
to enable TypeScript support.

To run unit tests:
```
yarn test
```

To run unit tests in watch mode:
```
yarn test -- --watch
```

And finally to run unit tests with coverage:
```
yarn test -- --coverage
```
When you run tests with coverage, the `coverage/` directory will be created at the root. You can
open the web version of the coverage report `coverage/lcov-report/index.html` to see which lines are covered by tests.

### <a name="ruling"></a>Ruling

The ruling test is a special integration test which launches the analysis of a large code base, 
and then compares those results to the set of expected issues (stored as snapshot files). 
To have this code base locally:
```
 git submodule init
 git submodule update
```

To run the ruling test:
```
yarn ruling
yarn ruling -- --rule <RuleFileName> # to run ruling for a single rule
yarn ruling -- --update # to update the snapshots
yarn ruling -- --rule <RuleFileName> --update # it is possible to combine both options
```

### Tools we use
* Visual Studio Code
* TSLint (and its extension for VSCode)
* Prettier (and its extension for VSCode)
