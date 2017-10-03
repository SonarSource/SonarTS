/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {ContentChildComp, Pane, Tab} from './content_child_example';

@NgModule({
  imports: [BrowserModule],
  declarations: [ContentChildComp, Pane, Tab],
  bootstrap: [ContentChildComp]
})
export class AppModule {
}
