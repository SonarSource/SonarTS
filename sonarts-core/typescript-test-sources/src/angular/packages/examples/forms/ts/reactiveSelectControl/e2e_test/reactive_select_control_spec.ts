/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementArrayFinder, ElementFinder, browser, by, element} from 'protractor';
import {verifyNoBrowserErrors} from '../../../../_common/e2e_util';

describe('reactiveSelectControl example', () => {
  afterEach(verifyNoBrowserErrors);
  let select: ElementFinder;
  let options: ElementArrayFinder;
  let p: ElementFinder;

  beforeEach(() => {
    browser.get('/forms/ts/reactiveSelectControl/index.html');
    select = element(by.css('select'));
    options = element.all(by.css('option'));
    p = element(by.css('p'));
  });

  it('should populate the initial selection', () => {
    expect(select.getAttribute('value')).toEqual('3: Object');
    expect(options.get(3).getAttribute('selected')).toBe('true');
  });

  it('should update the model when the value changes in the UI', () => {
    select.click();
    options.get(0).click();

    expect(p.getText()).toEqual('Form value: { "state": { "name": "Arizona", "abbrev": "AZ" } }');
  });

});
