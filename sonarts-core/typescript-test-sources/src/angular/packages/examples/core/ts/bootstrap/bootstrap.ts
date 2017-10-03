/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

// #docregion bootstrap
@Component({selector: 'my-app', template: 'Hello {{ name }}!'})
class MyApp {
  name: string = 'World';
}

@NgModule({imports: [BrowserModule], bootstrap: [MyApp]})
class AppModule {
}

export function main() {
  platformBrowserDynamic().bootstrapModule(AppModule);
}

// #enddocregion
