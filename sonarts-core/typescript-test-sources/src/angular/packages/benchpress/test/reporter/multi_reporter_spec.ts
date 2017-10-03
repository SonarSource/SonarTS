/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AsyncTestCompleter, describe, expect, inject, it} from '@angular/core/testing/src/testing_internal';

import {MeasureValues, MultiReporter, ReflectiveInjector, Reporter} from '../../index';

export function main() {
  function createReporters(ids: any[]) {
    const r = ReflectiveInjector
                  .resolveAndCreate([
                    ids.map(id => ({provide: id, useValue: new MockReporter(id)})),
                    MultiReporter.provideWith(ids)
                  ])
                  .get(MultiReporter);
    return Promise.resolve(r);
  }

  describe('multi reporter', () => {

    it('should reportMeasureValues to all',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const mv = new MeasureValues(0, new Date(), {});
         createReporters(['m1', 'm2']).then((r) => r.reportMeasureValues(mv)).then((values) => {

           expect(values).toEqual([{'id': 'm1', 'values': mv}, {'id': 'm2', 'values': mv}]);
           async.done();
         });
       }));

    it('should reportSample to call', inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const completeSample =
             [new MeasureValues(0, new Date(), {}), new MeasureValues(1, new Date(), {})];
         const validSample = [completeSample[1]];

         createReporters(['m1', 'm2'])
             .then((r) => r.reportSample(completeSample, validSample))
             .then((values) => {

               expect(values).toEqual([
                 {'id': 'm1', 'completeSample': completeSample, 'validSample': validSample},
                 {'id': 'm2', 'completeSample': completeSample, 'validSample': validSample}
               ]);
               async.done();
             });
       }));

  });
}

class MockReporter extends Reporter {
  constructor(private _id: string) { super(); }

  reportMeasureValues(values: MeasureValues): Promise<{[key: string]: any}> {
    return Promise.resolve({'id': this._id, 'values': values});
  }

  reportSample(completeSample: MeasureValues[], validSample: MeasureValues[]):
      Promise<{[key: string]: any}> {
    return Promise.resolve(
        {'id': this._id, 'completeSample': completeSample, 'validSample': validSample});
  }
}
