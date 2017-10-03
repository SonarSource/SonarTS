/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AsyncTestCompleter, beforeEach, describe, expect, inject, it} from '@angular/core/testing/src/testing_internal';
import {ResourceLoaderImpl} from '../../src/resource_loader/resource_loader_impl';

export function main() {
  describe('ResourceLoaderImpl', () => {
    let resourceLoader: ResourceLoaderImpl;

    // TODO(juliemr): This file currently won't work with dart unit tests run using
    // exclusive it or describe (iit or ddescribe). This is because when
    // pub run test is executed against this specific file the relative paths
    // will be relative to here, so url200 should look like
    // static_assets/200.html.
    // We currently have no way of detecting this.
    const url200 = '/base/packages/platform-browser/test/browser/static_assets/200.html';
    const url404 = '/bad/path/404.html';

    beforeEach(() => { resourceLoader = new ResourceLoaderImpl(); });

    it('should resolve the Promise with the file content on success',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         resourceLoader.get(url200).then((text) => {
           expect(text.trim()).toEqual('<p>hey</p>');
           async.done();
         });
       }), 10000);

    it('should reject the Promise on failure',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         resourceLoader.get(url404).catch((e) => {
           expect(e).toEqual(`Failed to load ${url404}`);
           async.done();
           return null;
         });
       }), 10000);
  });
}
