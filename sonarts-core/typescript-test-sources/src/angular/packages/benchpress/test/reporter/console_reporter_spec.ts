/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Provider} from '@angular/core';
import {describe, expect, it} from '@angular/core/testing/src/testing_internal';

import {ConsoleReporter, MeasureValues, ReflectiveInjector, SampleDescription} from '../../index';

export function main() {
  describe('console reporter', () => {
    let reporter: ConsoleReporter;
    let log: string[];

    function createReporter(
        {columnWidth = null, sampleId = null, descriptions = null, metrics = null}: {
          columnWidth?: number,
          sampleId?: string,
          descriptions?: {[key: string]: any}[],
          metrics?: {[key: string]: any}
        }) {
      log = [];
      if (!descriptions) {
        descriptions = [];
      }
      if (sampleId == null) {
        sampleId = 'null';
      }
      const providers: Provider[] = [
        ConsoleReporter.PROVIDERS, {
          provide: SampleDescription,
          useValue: new SampleDescription(sampleId, descriptions, metrics !)
        },
        {provide: ConsoleReporter.PRINT, useValue: (line: string) => log.push(line)}
      ];
      if (columnWidth != null) {
        providers.push({provide: ConsoleReporter.COLUMN_WIDTH, useValue: columnWidth});
      }
      reporter = ReflectiveInjector.resolveAndCreate(providers).get(ConsoleReporter);
    }

    it('should print the sample id, description and table header', () => {
      createReporter({
        columnWidth: 8,
        sampleId: 'someSample',
        descriptions: [{'a': 1, 'b': 2}],
        metrics: {'m1': 'some desc', 'm2': 'some other desc'}
      });
      expect(log).toEqual([
        'BENCHMARK someSample',
        'Description:',
        '- a: 1',
        '- b: 2',
        'Metrics:',
        '- m1: some desc',
        '- m2: some other desc',
        '',
        '      m1 |       m2',
        '-------- | --------',
      ]);
    });

    it('should print a table row', () => {
      createReporter({columnWidth: 8, metrics: {'a': '', 'b': ''}});
      log = [];
      reporter.reportMeasureValues(mv(0, 0, {'a': 1.23, 'b': 2}));
      expect(log).toEqual(['    1.23 |     2.00']);
    });

    it('should print the table footer and stats when there is a valid sample', () => {
      createReporter({columnWidth: 8, metrics: {'a': '', 'b': ''}});
      log = [];
      reporter.reportSample([], [mv(0, 0, {'a': 3, 'b': 6}), mv(1, 1, {'a': 5, 'b': 9})]);
      expect(log).toEqual(['======== | ========', '4.00+-25% | 7.50+-20%']);
    });

    it('should print the coefficient of variation only when it is meaningful', () => {
      createReporter({columnWidth: 8, metrics: {'a': '', 'b': ''}});
      log = [];
      reporter.reportSample([], [mv(0, 0, {'a': 3, 'b': 0}), mv(1, 1, {'a': 5, 'b': 0})]);
      expect(log).toEqual(['======== | ========', '4.00+-25% |     0.00']);
    });

  });
}

function mv(runIndex: number, time: number, values: {[key: string]: number}) {
  return new MeasureValues(runIndex, new Date(time), values);
}
