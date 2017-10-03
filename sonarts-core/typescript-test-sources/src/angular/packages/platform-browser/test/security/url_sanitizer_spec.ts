/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as t from '@angular/core/testing/src/testing_internal';

import {getDOM} from '../../src/dom/dom_adapter';
import {sanitizeSrcset, sanitizeUrl} from '../../src/security/url_sanitizer';

export function main() {
  t.describe('URL sanitizer', () => {
    let logMsgs: string[];
    let originalLog: (msg: any) => any;

    t.beforeEach(() => {
      logMsgs = [];
      originalLog = getDOM().log;  // Monkey patch DOM.log.
      getDOM().log = (msg) => logMsgs.push(msg);
    });
    t.afterEach(() => { getDOM().log = originalLog; });

    t.it('reports unsafe URLs', () => {
      t.expect(sanitizeUrl('javascript:evil()')).toBe('unsafe:javascript:evil()');
      t.expect(logMsgs.join('\n')).toMatch(/sanitizing unsafe URL value/);
    });

    t.describe('valid URLs', () => {
      const validUrls = [
        '',
        'http://abc',
        'HTTP://abc',
        'https://abc',
        'HTTPS://abc',
        'ftp://abc',
        'FTP://abc',
        'mailto:me@example.com',
        'MAILTO:me@example.com',
        'tel:123-123-1234',
        'TEL:123-123-1234',
        '#anchor',
        '/page1.md',
        'http://JavaScript/my.js',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/',  // Truncated.
        'data:video/webm;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/',
        'data:audio/opus;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/',
      ];
      for (const url of validUrls) {
        t.it(`valid ${url}`, () => t.expect(sanitizeUrl(url)).toEqual(url));
      }
    });

    t.describe('invalid URLs', () => {
      const invalidUrls = [
        'javascript:evil()',
        'JavaScript:abc',
        'evilNewProtocol:abc',
        ' \n Java\n Script:abc',
        '&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;',
        '&#106&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;',
        '&#106 &#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;',
        '&#0000106&#0000097&#0000118&#0000097&#0000115&#0000099&#0000114&#0000105&#0000112&#0000116&#0000058',
        '&#x6A&#x61&#x76&#x61&#x73&#x63&#x72&#x69&#x70&#x74&#x3A;',
        'jav&#x09;ascript:alert();',
        'jav\u0000ascript:alert();',
        'data:;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/',
        'data:,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/',
        'data:iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/',
        'data:text/javascript;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/',
        'data:application/x-msdownload;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/',
      ];
      for (const url of invalidUrls) {
        t.it(`valid ${url}`, () => t.expect(sanitizeUrl(url)).toMatch(/^unsafe:/));
      }
    });

    t.describe('valid srcsets', () => {
      const validSrcsets = [
        '',
        'http://angular.io/images/test.png',
        'http://angular.io/images/test.png, http://angular.io/images/test.png',
        'http://angular.io/images/test.png, http://angular.io/images/test.png, http://angular.io/images/test.png',
        'http://angular.io/images/test.png 2x',
        'http://angular.io/images/test.png 2x, http://angular.io/images/test.png 3x',
        'http://angular.io/images/test.png 1.5x',
        'http://angular.io/images/test.png 1.25x',
        'http://angular.io/images/test.png 200w, http://angular.io/images/test.png 300w',
        'https://angular.io/images/test.png, http://angular.io/images/test.png',
        'http://angular.io:80/images/test.png, http://angular.io:8080/images/test.png',
        'http://www.angular.io:80/images/test.png, http://www.angular.io:8080/images/test.png',
        'https://angular.io/images/test.png, https://angular.io/images/test.png',
        '//angular.io/images/test.png, //angular.io/images/test.png',
        '/images/test.png, /images/test.png',
        'images/test.png, images/test.png',
        'http://angular.io/images/test.png?12345, http://angular.io/images/test.png?12345',
        'http://angular.io/images/test.png?maxage, http://angular.io/images/test.png?maxage',
        'http://angular.io/images/test.png?maxage=234, http://angular.io/images/test.png?maxage=234',
      ];
      for (const srcset of validSrcsets) {
        t.it(`valid ${srcset}`, () => t.expect(sanitizeSrcset(srcset)).toEqual(srcset));
      }
    });

    t.describe('invalid srcsets', () => {
      const invalidSrcsets = [
        'ht:tp://angular.io/images/test.png',
        'http://angular.io/images/test.png, ht:tp://angular.io/images/test.png',
      ];
      for (const srcset of invalidSrcsets) {
        t.it(`valid ${srcset}`, () => t.expect(sanitizeSrcset(srcset)).toMatch(/unsafe:/));
      }
    });

  });
}
