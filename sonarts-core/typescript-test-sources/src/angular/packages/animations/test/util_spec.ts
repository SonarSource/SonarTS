/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {scheduleMicroTask} from '../src/util';

export function main() {
  describe('util', () => {
    it('should schedule a microtask and not call an async timeout', (done) => {
      let count = 0;
      scheduleMicroTask(() => count++);

      expect(count).toEqual(0);
      Promise.resolve(null).then(() => {
        expect(count).toEqual(1);
        done();
      });
      expect(count).toEqual(0);
    });
  });
}
