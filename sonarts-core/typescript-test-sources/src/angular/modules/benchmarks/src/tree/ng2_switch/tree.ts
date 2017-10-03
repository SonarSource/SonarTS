/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Input, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {TreeNode, emptyTree} from '../util';

@Component({
  selector: 'tree',
  template: `<ng-container [ngSwitch]="data.depth % 2">
    <span *ngSwitchCase="0" style="background-color: grey"> {{data.value}} </span>
    <span *ngSwitchDefault> {{data.value}} </span>
    <tree *ngIf='data.right != null' [data]='data.right'></tree><tree *ngIf='data.left != null' [data]='data.left'></tree>`
})
export class TreeComponent {
  @Input()
  data: TreeNode = emptyTree;
}

@NgModule({
  imports: [BrowserModule],
  bootstrap: [TreeComponent],
  declarations: [TreeComponent],
})
export class AppModule {
}
