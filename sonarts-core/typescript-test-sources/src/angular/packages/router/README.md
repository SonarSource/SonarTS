Angular Router
=========

Managing state transitions is one of the hardest parts of building applications. This is especially true on the web, where you also need to ensure that the state is reflected in the URL. In addition, we often want to split applications into multiple bundles and load them on demand. Doing this transparently isn’t trivial.

The Angular router is designed to solve these problems. Using the router, you can declaratively specify application state, manage state transitions while taking care of the URL, and load components on demand.

## Overview
Read the overview of the Router [here](https://vsavkin.com/angular-2-router-d9e30599f9ea).

## Guide
Read the dev guide [here](https://angular.io/docs/ts/latest/guide/router.html).

## Local development

```
# keep @angular/router fresh
$ ./scripts/karma.sh

# keep @angular/core fresh
$ ../../../node_modules/.bin/tsc -p modules --emitDecoratorMetadata -w

# start karma
$ ./scripts/karma.sh
```
