# SonarTS [![Build Status](https://travis-ci.org/SonarSource/SonarTS.svg?branch=master)](https://travis-ci.org/SonarSource/SonarTS) [![NPM version](https://badge.fury.io/js/tslint-sonarts.svg)](http://badge.fury.io/js/tslint-sonarts) [![Quality Gate](https://next.sonarqube.com/sonarqube/api/badges/gate?key=sonarts)](https://next.sonarqube.com/sonarqube/dashboard?id=sonarts) [![Coverage](https://next.sonarqube.com/sonarqube/api/badges/measure?key=sonarts&metric=coverage)](https://next.sonarqube.com/sonarqube/component_measures/domain/Coverage?id=sonarts)

Static code analyzer for TypeScript detecting bugs and suspicious patterns in your code.

**Follow us on [twitter](https://twitter.com/sonardash)** <br>

_[To analyze pure JavaScript code, see SonarJS](https://github.com/SonarSource/sonarjs)_

How does it work?

* The [TypeScript compiler](https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API) provides [**AST**](https://en.wikipedia.org/wiki/Abstract_syntax_tree) and **type** information
* On top of it we build the **symbol model** and the [**control flow**](https://en.wikipedia.org/wiki/Control_flow_graph) model
* Some rules are based on AST equivalence (like [no-all-duplicated-branches][`no-all-duplicated-branches`] or [no-identical-expressions][`no-identical-expressions`]).
* We use **[live variable analysis](https://en.wikipedia.org/wiki/Live_variable_analysis)** to detect [dead stores][`no-dead-store`]
* Experimentally, some of the rules are progressively starting to use **[symbolic execution](https://en.wikipedia.org/wiki/Symbolic_execution)** to catch data-flow-related bugs [`no-gratuitous-expressions`]

## Rules

* Functions should not be too complex ([`mccabe-complexity`])
* Getters and setters should access the expected fields ([`no-accessor-field-mismatch`]) ([`requires type-check`])
* All branches in a conditional structure should not have exactly the same implementation ([`no-all-duplicated-branches`])
* `delete` should not be used on arrays ([`no-array-delete`]) ([`requires type-check`])
* Collection sizes and array length comparisons should make sense ([`no-collection-size-mischeck`]) ([`requires type-check`])
* Dead stores should be removed ([`no-dead-store`]) ([`requires type-check`])
* Two branches in a conditional structure should not have exactly the same implementation ([`no-duplicated-branches`])
* Collections elements should not be overwritten unconditionally ([`no-element-overwrite`]) ([`requires type-check`])
* Destructuring patterns should not be empty ([`no-empty-destructuring`])
* Nested blocks of code should not be left empty ([`no-empty-nested-blocks`])
* Conditions should not always evaluate to "true" or to "false" ([`no-gratuitous-expressions`])
* Related "if/else if" statements and "cases" in a "switch" should not have the same condition ([`no-identical-conditions`])
* Identical expressions should not be used on both sides of a binary operator ([`no-identical-expressions`])
* Functions should not have identical implementations ([`no-identical-functions`])
* Function parameters, caught exceptions and foreach variables' initial values should not be ignored ([`no-ignored-initial-value`]) ([`requires type-check`])
* Return values should not be ignored when function calls don't have any side effects ([`no-ignored-return`]) ([`requires type-check`])
* Functions should use "return" consistently ([`no-inconsistent-return`])
* `Array.reverse` should not be used misleadingly ([`no-misleading-array-reverse`]) ([`requires type-check`])
* Non-existent operators '=+', '=-' and '=!' should not be used ([`no-misspelled-operator`])
* Multiline string literals should not be used ([`no-multiline-string-literals`])
* Redundant pairs of parentheses should be removed ([`no-redundant-parentheses`])
* Primitive return types should be used ([`no-return-type-any`]) ([`requires type-check`])
* Conditionals should start on new lines ([`no-same-line-conditional`])
* Variables should not be self-assigned ([`no-self-assignment`]) ([`requires type-check`])
* Jump statements should not be used unconditionally ([`no-unconditional-jump`])
* Multiline blocks should be enclosed in curly braces ([`no-unenclosed-multiline-block`])
* Errors should not be created without being thrown ([`no-unthrown-error`])
* Array contents should be used ([`no-unused-array`]) ([`requires type-check`])
* Redundant casts and not-null assertions should be avoided ([`no-useless-cast`]) ([`requires type-check`])
* Values should not be uselessly incremented ([`no-useless-increment`])
* The output of functions that don't return anything should not be used ([`no-use-of-empty-return-value`]) ([`requires type-check`])
* Variables should be declared before they are used ([`no-variable-usage-before-declaration`]) ([`requires type-check`])
* Type aliases should be used ([`use-type-alias`]) ([`requires type-check`])

[`mccabe-complexity`]: ./sonarts-core/docs/rules/mccabe-complexity.md
[`no-accessor-field-mismatch`]: ./sonarts-core/docs/rules/no-accessor-field-mismatch.md
[`no-all-duplicated-branches`]: ./sonarts-core/docs/rules/no-all-duplicated-branches.md
[`no-array-delete`]: ./sonarts-core/docs/rules/no-array-delete.md
[`no-collection-size-mischeck`]: ./sonarts-core/docs/rules/no-collection-size-mischeck.md
[`no-dead-store`]: ./sonarts-core/docs/rules/no-dead-store.md
[`no-duplicated-branches`]: ./sonarts-core/docs/rules/no-duplicated-branches.md
[`no-element-overwrite`]: sonarts-core/docs/rules/no-element-overwrite.md
[`no-empty-destructuring`]: ./sonarts-core/docs/rules/no-empty-destructuring.md
[`no-empty-nested-blocks`]: ./sonarts-core/docs/rules/no-empty-nested-blocks.md
[`no-gratuitous-expressions`]: ./sonarts-core/docs/rules/no-gratuitous-expressions.md
[`no-identical-conditions`]: ./sonarts-core/docs/rules/no-identical-conditions.md
[`no-identical-expressions`]: ./sonarts-core/docs/rules/no-identical-expressions.md
[`no-identical-functions`]: ./sonarts-core/docs/rules/no-identical-functions.md
[`no-ignored-initial-value`]: ./sonarts-core/docs/rules/no-ignored-initial-value.md
[`no-ignored-return`]: ./sonarts-core/docs/rules/no-ignored-return.md
[`no-inconsistent-return`]: ./sonarts-core/docs/rules/no-inconsistent-return.md
[`no-misleading-array-reverse`]: ./sonarts-core/docs/rules/no-misleading-array-reverse.md
[`no-misspelled-operator`]: ./sonarts-core/docs/rules/no-misspelled-operator.md
[`no-multiline-string-literals`]: ./sonarts-core/docs/rules/no-multiline-string-literals.md
[`no-redundant-parentheses`]: ./sonarts-core/docs/rules/no-redundant-parentheses.md
[`no-return-type-any`]: ./sonarts-core/docs/rules/no-return-type-any.md
[`no-same-line-conditional`]: ./sonarts-core/docs/rules/no-same-line-conditional.md
[`no-self-assignment`]: ./sonarts-core/docs/rules/no-self-assignment.md
[`no-unconditional-jump`]: ./sonarts-core/docs/rules/no-unconditional-jump.md
[`no-unenclosed-multiline-block`]: ./sonarts-core/docs/rules/no-unenclosed-multiline-block.md
[`no-unthrown-error`]: ./sonarts-core/docs/rules/no-unthrown-error.md
[`no-unused-array`]: ./sonarts-core/docs/rules/no-unused-array.md
[`no-useless-cast`]: ./sonarts-core/docs/rules/no-useless-cast.md
[`no-useless-increment`]: ./sonarts-core/docs/rules/no-useless-increment.md
[`no-use-of-empty-return-value`]: ./sonarts-core/docs/rules/no-use-of-empty-return-value.md
[`no-variable-usage-before-declaration`]: ./sonarts-core/docs/rules/no-variable-usage-before-declaration.md
[`use-type-alias`]: ./sonarts-core/docs/rules/use-type-alias.md
[`requires type-check`]: https://palantir.github.io/tslint/usage/type-checking/

## Use in TSLint

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

## Use in SonarQube

SonarTS is available as plugin for SonarQube. [SonarQube](https://www.sonarqube.org/) is an open source platform for continuous inspection of code quality.
Thanks to the platform, SonarTS provides additional features:

* Code coverage import
* Duplication detection
* Various metrics
* More [rules](https://rules.sonarsource.com/typescript)

See the documentation [here](https://docs.sonarqube.org/display/PLUG/SonarTS) and example project [here](https://github.com/SonarSource/SonarTS-example/).

Also available online on :cloud: [SonarCloud](https://sonarcloud.io/)

## Contributing

You want to participate to the development of our TypeScript analyzer?
Have a look at our [contributor](./CONTRIBUTING.md) guide!
