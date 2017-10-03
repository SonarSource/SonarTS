/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {beforeEach, describe, it} from '@angular/core/testing/src/testing_internal';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {DomSharedStylesHost} from '@angular/platform-browser/src/dom/shared_styles_host';
import {expect} from '@angular/platform-browser/testing/src/matchers';

export function main() {
  describe('DomSharedStylesHost', () => {
    let doc: Document;
    let ssh: DomSharedStylesHost;
    let someHost: Element;
    beforeEach(() => {
      doc = getDOM().createHtmlDocument();
      doc.title = '';
      ssh = new DomSharedStylesHost(doc);
      someHost = getDOM().createElement('div');
    });

    it('should add existing styles to new hosts', () => {
      ssh.addStyles(['a {};']);
      ssh.addHost(someHost);
      expect(getDOM().getInnerHTML(someHost)).toEqual('<style>a {};</style>');
    });

    it('should add new styles to hosts', () => {
      ssh.addHost(someHost);
      ssh.addStyles(['a {};']);
      expect(getDOM().getInnerHTML(someHost)).toEqual('<style>a {};</style>');
    });

    it('should add styles only once to hosts', () => {
      ssh.addStyles(['a {};']);
      ssh.addHost(someHost);
      ssh.addStyles(['a {};']);
      expect(getDOM().getInnerHTML(someHost)).toEqual('<style>a {};</style>');
    });

    it('should use the document head as default host', () => {
      ssh.addStyles(['a {};', 'b {};']);
      expect(doc.head).toHaveText('a {};b {};');
    });

    it('should remove style nodes on destroy', () => {
      ssh.addStyles(['a {};']);
      ssh.addHost(someHost);
      expect(getDOM().getInnerHTML(someHost)).toEqual('<style>a {};</style>');

      ssh.ngOnDestroy();
      expect(getDOM().getInnerHTML(someHost)).toEqual('');
    });
  });
}
