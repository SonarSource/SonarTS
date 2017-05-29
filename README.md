# SonarTS [![Build Status](https://travis-ci.org/SonarSource/SonarTS.svg?branch=master)](https://travis-ci.org/SonarSource/SonarTS)

## Rules

* All branches in a conditional structure should not have exactly the same implementation ([`no-all-duplicated-branches`])
* Destructuring patterns should not be empty ([`no-empty-destructuring`])
* Related "if/else if" statements and "cases" in a "switch" should not have the same condition ([`no-identical-conditions`])
* Identical expressions should not be used on both sides of a binary operator ([`no-identical-expressions`])
* Return values should not be ignored when function calls don't have any side effects ([`no-ignored-return`])
* The output of functions that don't return anything should not be used ([`no-use-of-empty-return-value`])
* Variables should be declared before they are used ([`no-variable-usage-before-declaration`])
* Variables should not be self-assigned ([`no-self-assignment`])

[`no-all-duplicated-branches`]: ./docs/rules/no-all-duplicated-branches.md
[`no-empty-destructuring`]: ./docs/rules/no-empty-destructuring.md
[`no-identical-conditions`]: ./docs/rules/no-identical-conditions.md
[`no-identical-expressions`]: ./docs/rules/no-identical-expressions.md
[`no-ignored-return`]: ./docs/rules/no-ignored-return.md
[`no-use-of-empty-return-value`]: ./docs/rules/no-use-of-empty-return-value.md
[`no-variable-usage-before-declaration`]: ./docs/rules/no-variable-usage-before-declaration.md
[`no-self-assignment`]: ./docs/rules/no-self-assignment.md

## Testing

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

## Ruling

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
yarn ruling -- --rule <RuleFileName> -- update # it is possible to combine both options
```
