/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgLocalization} from '@angular/common';
import {Component, DebugElement} from '@angular/core';
import {ComponentFixture} from '@angular/core/testing';

import {By} from '@angular/platform-browser/src/dom/debug/by';
import {stringifyElement} from '@angular/platform-browser/testing/src/browser_util';
import {expect} from '@angular/platform-browser/testing/src/matchers';

@Component({
  selector: 'i18n-cmp',
  template: '',
})
export class I18nComponent {
  count: number;
  sex: string;
  sexB: string;
  response: any = {getItemsList: (): any[] => []};
}

export class FrLocalization extends NgLocalization {
  getPluralCategory(value: number): string {
    switch (value) {
      case 0:
      case 1:
        return 'one';
      default:
        return 'other';
    }
  }
}

export function validateHtml(
    tb: ComponentFixture<I18nComponent>, cmp: I18nComponent, el: DebugElement) {
  expectHtml(el, 'h1').toBe('<h1>attributs i18n sur les balises</h1>');
  expectHtml(el, '#i18n-1').toBe('<div id="i18n-1"><p>imbriqué</p></div>');
  expectHtml(el, '#i18n-2').toBe('<div id="i18n-2"><p>imbriqué</p></div>');
  expectHtml(el, '#i18n-3').toBe('<div id="i18n-3"><p><i>avec des espaces réservés</i></p></div>');
  expectHtml(el, '#i18n-3b')
      .toBe(
          '<div id="i18n-3b"><p><i class="preserved-on-placeholders">avec des espaces réservés</i></p></div>');
  expectHtml(el, '#i18n-4').toBe('<p id="i18n-4" title="sur des balises non traductibles"></p>');
  expectHtml(el, '#i18n-5').toBe('<p id="i18n-5" title="sur des balises traductibles"></p>');
  expectHtml(el, '#i18n-6').toBe('<p id="i18n-6" title=""></p>');

  cmp.count = 0;
  tb.detectChanges();
  expect(el.query(By.css('#i18n-7')).nativeElement).toHaveText('zero');
  expect(el.query(By.css('#i18n-14')).nativeElement).toHaveText('zero');
  cmp.count = 1;
  tb.detectChanges();
  expect(el.query(By.css('#i18n-7')).nativeElement).toHaveText('un');
  expect(el.query(By.css('#i18n-14')).nativeElement).toHaveText('un');
  expect(el.query(By.css('#i18n-17')).nativeElement).toHaveText('un');
  cmp.count = 2;
  tb.detectChanges();
  expect(el.query(By.css('#i18n-7')).nativeElement).toHaveText('deux');
  expect(el.query(By.css('#i18n-14')).nativeElement).toHaveText('deux');
  expect(el.query(By.css('#i18n-17')).nativeElement).toHaveText('deux');
  cmp.count = 3;
  tb.detectChanges();
  expect(el.query(By.css('#i18n-7')).nativeElement).toHaveText('beaucoup');
  expect(el.query(By.css('#i18n-14')).nativeElement).toHaveText('beaucoup');
  expect(el.query(By.css('#i18n-17')).nativeElement).toHaveText('beaucoup');

  cmp.sex = 'm';
  cmp.sexB = 'f';
  tb.detectChanges();
  expect(el.query(By.css('#i18n-8')).nativeElement).toHaveText('homme');
  expect(el.query(By.css('#i18n-8b')).nativeElement).toHaveText('femme');
  cmp.sex = 'f';
  tb.detectChanges();
  expect(el.query(By.css('#i18n-8')).nativeElement).toHaveText('femme');

  cmp.count = 123;
  tb.detectChanges();
  expectHtml(el, '#i18n-9').toEqual('<div id="i18n-9">count = 123</div>');

  cmp.sex = 'f';
  tb.detectChanges();
  expectHtml(el, '#i18n-10').toEqual('<div id="i18n-10">sexe = f</div>');

  expectHtml(el, '#i18n-11').toEqual('<div id="i18n-11">custom name</div>');
  expectHtml(el, '#i18n-12').toEqual('<h1 id="i18n-12">Balises dans les commentaires html</h1>');
  expectHtml(el, '#i18n-13').toBe('<div id="i18n-13" title="dans une section traductible"></div>');
  expectHtml(el, '#i18n-15').toMatch(/ca <b>devrait<\/b> marcher/);
  expectHtml(el, '#i18n-16').toMatch(/avec un ID explicite/);
  expectHtml(el, '#i18n-18')
      .toEqual('<div id="i18n-18">FOO<a title="dans une section traductible">BAR</a></div>');
}

function expectHtml(el: DebugElement, cssSelector: string): any {
  return expect(stringifyElement(el.query(By.css(cssSelector)).nativeElement));
}

export const HTML = `
<div>
    <h1 i18n>i18n attribute on tags</h1>
    
    <div id="i18n-1"><p i18n>nested</p></div>
    
    <div id="i18n-2"><p i18n="different meaning|">nested</p></div>
    
    <div id="i18n-3"><p i18n><i>with placeholders</i></p></div>
    <div id="i18n-3b"><p i18n><i class="preserved-on-placeholders">with placeholders</i></p></div>
    
    <div>
        <p id="i18n-4" i18n-title title="on not translatable node"></p>
        <p id="i18n-5" i18n i18n-title title="on translatable node"></p>
        <p id="i18n-6" i18n-title title></p>
    </div>
    
    <!-- no ph below because the ICU node is the only child of the div, i.e. no text nodes --> 
    <div i18n id="i18n-7">{count, plural, =0 {zero} =1 {one} =2 {two} other {<b>many</b>}}</div>
    
    <div i18n id="i18n-8">
        {sex, select, m {male} f {female}}
    </div>
    <div i18n id="i18n-8b">
        {sexB, select, m {male} f {female}}
    </div>
    
    <div i18n id="i18n-9">{{ "count = " + count }}</div>
    <div i18n id="i18n-10">sex = {{ sex }}</div>
    <div i18n id="i18n-11">{{ "custom name" //i18n(ph="CUSTOM_NAME") }}</div>    
</div>

<!-- i18n -->
    <h1 id="i18n-12" >Markers in html comments</h1>   
    <div id="i18n-13" i18n-title title="in a translatable section"></div>
    <div id="i18n-14">{count, plural, =0 {zero} =1 {one} =2 {two} other {<b>many</b>}}</div>
<!-- /i18n -->

<div id="i18n-15"><ng-container i18n>it <b>should</b> work</ng-container></div>

<div id="i18n-16" i18n="@@i18n16">with an explicit ID</div>
<div id="i18n-17" i18n="@@i18n17">{count, plural, =0 {zero} =1 {one} =2 {two} other {<b>many</b>}}</div>

<!-- make sure that ICU messages are not treated as text nodes -->
<div i18n="desc">{
    response.getItemsList().length,
    plural,
    =0 {Found no results}
    =1 {Found one result}
    other {Found {{response.getItemsList().length}} results}
}</div>

<div i18n id="i18n-18">foo<a i18n-title title="in a translatable section">bar</a></div>

<div i18n>{{ 'test' //i18n(ph="map name") }}</div>
`;
