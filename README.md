# SonarTS

## Testing

The awesome [jest](http://facebook.github.io/jest/) test runner is used. There is just a 
[little configuration](https://github.com/SonarSource/SonarTS/blob/master/jest.config.js) required 
to enable TypeScript support.

To run unit tests:
```
yarn test
```

To run ruling tests:
```
yarn ruling
```
The ruling test is a special integration test which launches the analysis of a large code base, and then compares those results to the set of expected issues (stored as snapshot files). To have this code base locally:
```
 git submodule init
 git submodule update
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
