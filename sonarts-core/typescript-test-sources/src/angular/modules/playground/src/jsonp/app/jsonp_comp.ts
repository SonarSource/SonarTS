/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {Jsonp} from '@angular/http';

@Component({
  selector: 'jsonp-app',
  template: `
    <h1>people</h1>
    <ul class="people">
      <li *ngFor="let person of people">
        hello, {{person['name']}}
      </li>
    </ul>
  `
})
export class JsonpCmp {
  people: Object;
  constructor(jsonp: Jsonp) {
    jsonp.get('./people.json?callback=JSONP_CALLBACK').subscribe(res => this.people = res.json());
  }
}
