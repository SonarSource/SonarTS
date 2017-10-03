/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementFinder, browser, by, element} from 'protractor';
import {verifyNoBrowserErrors} from '../../../../../_common/e2e_util';

describe('contentChildren example', () => {
  afterEach(verifyNoBrowserErrors);
  let button: ElementFinder;
  let resultTopLevel: ElementFinder;
  let resultNested: ElementFinder;

  beforeEach(() => {
    browser.get('/core/di/ts/contentChildren/index.html');
    button = element(by.css('button'));
    resultTopLevel = element(by.css('.top-level'));
    resultNested = element(by.css('.nested'));
  });

  it('should query content children', () => {
    expect(resultTopLevel.getText()).toEqual('Top level panes: 1, 2');

    button.click();

    expect(resultTopLevel.getText()).toEqual('Top level panes: 1, 2, 3');
  });

  it('should query nested content children', () => {
    expect(resultNested.getText()).toEqual('Arbitrary nested panes: 1, 2');

    button.click();

    expect(resultNested.getText()).toEqual('Arbitrary nested panes: 1, 2, 3, 3_1, 3_2');
  });
});
