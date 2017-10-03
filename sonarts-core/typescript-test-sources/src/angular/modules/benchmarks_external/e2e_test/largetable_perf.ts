/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runClickBenchmark, verifyNoBrowserErrors} from '@angular/testing/src/perf_util';

describe('ng1.x largetable benchmark', function() {
  const URL = 'benchmarks_external/src/largetable/largetable_benchmark.html';

  afterEach(verifyNoBrowserErrors);

  ['baselineBinding', 'baselineInterpolation', 'ngBind', 'ngBindOnce', 'interpolation',
   'interpolationAttr', 'ngBindFn', 'interpolationFn', 'ngBindFilter', 'interpolationFilter']
      .forEach(function(benchmarkType) {
        it('should log the stats with: ' + benchmarkType, function(done) {
          runClickBenchmark({
            url: URL,
            buttons: ['#destroyDom', '#createDom'],
            id: 'ng1.largetable.' + benchmarkType,
            params: [
              {name: 'columns', value: 100, scale: 'sqrt'},
              {name: 'rows', value: 20, scale: 'sqrt'},
              {name: 'benchmarkType', value: benchmarkType}
            ],
            waitForAngular2: false
          }).then(done, done.fail);
        });
      });
});
