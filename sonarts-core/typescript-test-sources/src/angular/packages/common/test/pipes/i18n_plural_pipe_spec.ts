/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {I18nPluralPipe, NgLocalization} from '@angular/common';
import {PipeResolver} from '@angular/compiler/src/pipe_resolver';
import {beforeEach, describe, expect, it} from '@angular/core/testing/src/testing_internal';

export function main() {
  describe('I18nPluralPipe', () => {
    let localization: NgLocalization;
    let pipe: I18nPluralPipe;

    const mapping = {
      '=0': 'No messages.',
      '=1': 'One message.',
      'many': 'Many messages.',
      'other': 'There are # messages, that is #.',
    };

    beforeEach(() => {
      localization = new TestLocalization();
      pipe = new I18nPluralPipe(localization);
    });

    it('should be marked as pure',
       () => { expect(new PipeResolver().resolve(I18nPluralPipe) !.pure).toEqual(true); });

    describe('transform', () => {
      it('should return 0 text if value is 0', () => {
        const val = pipe.transform(0, mapping);
        expect(val).toEqual('No messages.');
      });

      it('should return 1 text if value is 1', () => {
        const val = pipe.transform(1, mapping);
        expect(val).toEqual('One message.');
      });

      it('should return category messages', () => {
        const val = pipe.transform(4, mapping);
        expect(val).toEqual('Many messages.');
      });

      it('should interpolate the value into the text where indicated', () => {
        const val = pipe.transform(6, mapping);
        expect(val).toEqual('There are 6 messages, that is 6.');
      });

      it('should use "" if value is undefined', () => {
        const val = pipe.transform(void(0) as any, mapping);
        expect(val).toEqual('');
      });

      it('should not support bad arguments',
         () => { expect(() => pipe.transform(0, <any>'hey')).toThrowError(); });
    });

  });
}

class TestLocalization extends NgLocalization {
  getPluralCategory(value: number): string { return value > 1 && value < 6 ? 'many' : 'other'; }
}
