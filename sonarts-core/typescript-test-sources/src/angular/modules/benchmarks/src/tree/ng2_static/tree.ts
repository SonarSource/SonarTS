/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Input, NgModule} from '@angular/core';
import {BrowserModule, DomSanitizer, SafeStyle} from '@angular/platform-browser';

import {TreeNode, emptyTree, maxDepth} from '../util';

let trustedEmptyColor: SafeStyle;
let trustedGreyColor: SafeStyle;

function createTreeComponent(level: number, isLeaf: boolean) {
  const nextTreeEl = `tree${level+1}`;
  let template = `<span [style.backgroundColor]="bgColor"> {{data.value}} </span>`;
  if (!isLeaf) {
    template +=
        `<${nextTreeEl} [data]='data.right'></${nextTreeEl}><${nextTreeEl} [data]='data.left'></${nextTreeEl}>`;
  }

  @Component({selector: `tree${level}`, template: template})
  class TreeComponent {
    @Input()
    data: TreeNode;
    get bgColor() { return this.data.depth % 2 ? trustedEmptyColor : trustedGreyColor; }
  }

  return TreeComponent;
}

@Component({selector: 'tree', template: `<tree0 *ngIf="data.left != null" [data]='data'></tree0>`})
export class RootTreeComponent {
  @Input()
  data: TreeNode = emptyTree;
}

function createModule(): any {
  const components: any[] = [RootTreeComponent];
  for (let i = 0; i <= maxDepth; i++) {
    components.push(createTreeComponent(i, i === maxDepth));
  }

  @NgModule({imports: [BrowserModule], bootstrap: [RootTreeComponent], declarations: [components]})
  class AppModule {
    constructor(sanitizer: DomSanitizer) {
      trustedEmptyColor = sanitizer.bypassSecurityTrustStyle('');
      trustedGreyColor = sanitizer.bypassSecurityTrustStyle('grey');
    }
  }

  return AppModule;
}

export const AppModule = createModule();
