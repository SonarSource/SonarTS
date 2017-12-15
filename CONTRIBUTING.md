# Contributing

## Create New Rule

* Create file for rule implementation in `src/rules`. File name should start with lower case and have suffix `Rule`
* Create test folder in `test/rules` with the name of the rule file
* In this folder create files `<rule file name>.test.ts` and `<rule file name>.lint.ts`
* Run [Ruling](#ruling) test
* Add rule key to `tslint-sonarts.json`
* In folder `docs/rules` create rule documentation file `<rule key>.md`
* In `README.md` add reference to the documentation file.

## Testing

The [jest](http://facebook.github.io/jest/) test runner is used. There is just a
[small configuration step](https://github.com/SonarSource/SonarTS/blob/master/sonarts-core/jest.config.js) required
to enable TypeScript support.

To run unit tests:

```
cd sonarts-core
yarn test
```

To run unit tests in watch mode:

```
cd sonarts-core
yarn test --watch
```

And finally to run unit tests with coverage:

```
cd sonarts-core
yarn test --coverage
```

When you run tests with coverage, the `coverage/` directory will be created at the root. You can
open the web version of the coverage report `coverage/lcov-report/index.html` to see which lines are covered by tests.

To run unit tests for SQ plugin part of the project

```
cd sonarts-sq-plugin
mvn clean install
```

To build SQ plugin part of the project

```
./build.sh
```

## <a name="ruling"></a>Ruling

The ruling test is a special integration test which launches the analysis of a large code base,
and then compares those results to the set of expected issues (stored as snapshot files).
To have this code base locally:

```
 git submodule init
 git submodule update
```

To run the ruling test:

```
cd sonarts-core
yarn ruling
yarn ruling --rule <RuleFileName> # to run ruling for a single rule
yarn ruling --update # to update the snapshots
yarn ruling --rule <RuleFileName> --update # it is possible to combine both options
```

## Debugging in Visual Studio Code

:warning: Make sure to open the `sonarts-code` directory, and not the root `SonarTS` one.

![image](https://user-images.githubusercontent.com/2317341/34045676-3e0456b0-e1aa-11e7-9278-7e109512de79.png)

There are two available configurations:

* "All Tests" runs... all tests!
* "Current Open Test" runs currenly opened file. In other words, you first need to open (focus tab) of the test you want to run, then click run.

## Tools we use

* Visual Studio Code
* Prettier (and its extension for VSCode)
