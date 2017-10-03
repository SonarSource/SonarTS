/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {NgModelGroupComp} from './ng_model_group_example';

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [NgModelGroupComp],
  bootstrap: [NgModelGroupComp]
})
export class AppModule {
}
