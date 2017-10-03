/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {describe, expect, it} from '@angular/core/testing/src/testing_internal';

import {ResponseOptions} from '../src/base_response_options';
import {Response} from '../src/static_response';



export function main() {
  describe('Response', () => {
    it('should be ok for 200 statuses', () => {
      expect(new Response(new ResponseOptions({status: 200})).ok).toEqual(true);
      expect(new Response(new ResponseOptions({status: 299})).ok).toEqual(true);
    });

    it('should not be ok for non 200 statuses', () => {
      expect(new Response(new ResponseOptions({status: 199})).ok).toEqual(false);
      expect(new Response(new ResponseOptions({status: 300})).ok).toEqual(false);
    });
  });
}
