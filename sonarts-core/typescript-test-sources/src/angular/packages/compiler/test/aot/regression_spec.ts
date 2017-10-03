/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {async} from '@angular/core/testing';

import {MockDirectory, compile, expectNoDiagnostics, setup} from './test_util';

describe('regressions', () => {
  let angularFiles = setup();

  it('should compile components with empty templates', async(() => {
       const appDir = {
         'app.module.ts': `
        import { Component, NgModule } from '@angular/core';

        @Component({template: ''})
        export class EmptyComp {}

        @NgModule({declarations: [EmptyComp]})
        export class MyModule {}
      `
       };
       const rootDir = {'app': appDir};
       compile([rootDir, angularFiles], {postCompile: expectNoDiagnostics}, {
         noUnusedLocals: true,
         noUnusedParameters: true
       }).then((result) => {
         expect(result.genFiles.find((f) => f.genFileUrl === '/app/app.module.ngfactory.ts'))
             .toBeTruthy();
       });
     }));
});
