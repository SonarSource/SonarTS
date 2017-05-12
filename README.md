# SonarTS

## Testing

The awesome [jest](http://facebook.github.io/jest/) test runner is used. There is just a 
[little configuration](https://github.com/SonarSource/SonarTS/blob/master/jest.config.js) required 
to enable TypeScript support.

To run tests:
```
yarn test
```

To run tests in watch mode:
```
yarn test -- --watch
```

And finally to run tests with coverage:
```
yarn test -- --coverage
```
When you run tests with coverage, the `coverage/` directory will be created at the root. You can
open the web version of the coverage report `coverage/lcov-report/index.html` to see which lines are covered by tests.