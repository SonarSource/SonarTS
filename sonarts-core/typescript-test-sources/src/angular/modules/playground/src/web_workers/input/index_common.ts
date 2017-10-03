/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

@Component({
  selector: 'input-app',
  template: `
    <h2>Input App</h2>
    <div id="input-container">
      <input type="text" (input)="inputChanged($event)">
      <textarea (input)="textAreaChanged($event)"></textarea>
      <div class="input-val">Input val is {{inputVal}}.</div>
      <div class="textarea-val">Textarea val is {{textareaVal}}.</div>
    </div>
    <div id="ng-model-container">
    </div>
  `
})
export class InputCmp {
  inputVal = '';
  textareaVal = '';

  inputChanged(e: Event) { this.inputVal = (e.target as HTMLInputElement).value; }

  textAreaChanged(e: Event) { this.textareaVal = (e.target as HTMLTextAreaElement).value; }
}
