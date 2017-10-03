/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DebugElement} from '@angular/core';

let debugElement: DebugElement = undefined !;
let predicate: any;

// #docregion scope_all
debugElement.query(predicate);
// #enddocregion
