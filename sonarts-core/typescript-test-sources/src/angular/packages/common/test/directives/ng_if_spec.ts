/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {By} from '@angular/platform-browser/src/dom/debug/by';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {expect} from '@angular/platform-browser/testing/src/matchers';

export function main() {
  describe('ngIf directive', () => {
    let fixture: ComponentFixture<any>;

    function getComponent(): TestComponent { return fixture.componentInstance; }

    afterEach(() => { fixture = null !; });

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [TestComponent],
        imports: [CommonModule],
      });
    });

    it('should work in a template attribute', async(() => {
         const template = '<span *ngIf="booleanCondition">hello</span>';
         fixture = createTestComponent(template);
         fixture.detectChanges();
         expect(fixture.debugElement.queryAll(By.css('span')).length).toEqual(1);
         expect(fixture.nativeElement).toHaveText('hello');
       }));

    it('should work on a template element', async(() => {
         const template = '<ng-template [ngIf]="booleanCondition">hello2</ng-template>';
         fixture = createTestComponent(template);
         fixture.detectChanges();
         expect(fixture.nativeElement).toHaveText('hello2');
       }));

    it('should toggle node when condition changes', async(() => {
         const template = '<span *ngIf="booleanCondition">hello</span>';
         fixture = createTestComponent(template);
         getComponent().booleanCondition = false;
         fixture.detectChanges();
         expect(fixture.debugElement.queryAll(By.css('span')).length).toEqual(0);
         expect(fixture.nativeElement).toHaveText('');

         getComponent().booleanCondition = true;
         fixture.detectChanges();
         expect(fixture.debugElement.queryAll(By.css('span')).length).toEqual(1);
         expect(fixture.nativeElement).toHaveText('hello');

         getComponent().booleanCondition = false;
         fixture.detectChanges();
         expect(fixture.debugElement.queryAll(By.css('span')).length).toEqual(0);
         expect(fixture.nativeElement).toHaveText('');
       }));

    it('should handle nested if correctly', async(() => {
         const template =
             '<div *ngIf="booleanCondition"><span *ngIf="nestedBooleanCondition">hello</span></div>';

         fixture = createTestComponent(template);

         getComponent().booleanCondition = false;
         fixture.detectChanges();
         expect(fixture.debugElement.queryAll(By.css('span')).length).toEqual(0);
         expect(fixture.nativeElement).toHaveText('');

         getComponent().booleanCondition = true;
         fixture.detectChanges();
         expect(fixture.debugElement.queryAll(By.css('span')).length).toEqual(1);
         expect(fixture.nativeElement).toHaveText('hello');

         getComponent().nestedBooleanCondition = false;
         fixture.detectChanges();
         expect(fixture.debugElement.queryAll(By.css('span')).length).toEqual(0);
         expect(fixture.nativeElement).toHaveText('');

         getComponent().nestedBooleanCondition = true;
         fixture.detectChanges();
         expect(fixture.debugElement.queryAll(By.css('span')).length).toEqual(1);
         expect(fixture.nativeElement).toHaveText('hello');

         getComponent().booleanCondition = false;
         fixture.detectChanges();
         expect(fixture.debugElement.queryAll(By.css('span')).length).toEqual(0);
         expect(fixture.nativeElement).toHaveText('');
       }));

    it('should update several nodes with if', async(() => {
         const template = '<span *ngIf="numberCondition + 1 >= 2">helloNumber</span>' +
             '<span *ngIf="stringCondition == \'foo\'">helloString</span>' +
             '<span *ngIf="functionCondition(stringCondition, numberCondition)">helloFunction</span>';

         fixture = createTestComponent(template);

         fixture.detectChanges();
         expect(fixture.debugElement.queryAll(By.css('span')).length).toEqual(3);
         expect(getDOM().getText(fixture.nativeElement))
             .toEqual('helloNumberhelloStringhelloFunction');

         getComponent().numberCondition = 0;
         fixture.detectChanges();
         expect(fixture.debugElement.queryAll(By.css('span')).length).toEqual(1);
         expect(fixture.nativeElement).toHaveText('helloString');

         getComponent().numberCondition = 1;
         getComponent().stringCondition = 'bar';
         fixture.detectChanges();
         expect(fixture.debugElement.queryAll(By.css('span')).length).toEqual(1);
         expect(fixture.nativeElement).toHaveText('helloNumber');
       }));

    it('should not add the element twice if the condition goes from truthy to truthy', async(() => {
         const template = '<span *ngIf="numberCondition">hello</span>';

         fixture = createTestComponent(template);

         fixture.detectChanges();
         let els = fixture.debugElement.queryAll(By.css('span'));
         expect(els.length).toEqual(1);
         getDOM().addClass(els[0].nativeElement, 'marker');
         expect(fixture.nativeElement).toHaveText('hello');

         getComponent().numberCondition = 2;
         fixture.detectChanges();
         els = fixture.debugElement.queryAll(By.css('span'));
         expect(els.length).toEqual(1);
         expect(getDOM().hasClass(els[0].nativeElement, 'marker')).toBe(true);

         expect(fixture.nativeElement).toHaveText('hello');
       }));

    describe('else', () => {
      it('should support else', async(() => {
           const template = '<span *ngIf="booleanCondition; else elseBlock">TRUE</span>' +
               '<ng-template #elseBlock>FALSE</ng-template>';

           fixture = createTestComponent(template);

           fixture.detectChanges();
           expect(fixture.nativeElement).toHaveText('TRUE');

           getComponent().booleanCondition = false;
           fixture.detectChanges();
           expect(fixture.nativeElement).toHaveText('FALSE');
         }));

      it('should support then and else', async(() => {
           const template =
               '<span *ngIf="booleanCondition; then thenBlock; else elseBlock">IGNORE</span>' +
               '<ng-template #thenBlock>THEN</ng-template>' +
               '<ng-template #elseBlock>ELSE</ng-template>';

           fixture = createTestComponent(template);

           fixture.detectChanges();
           expect(fixture.nativeElement).toHaveText('THEN');

           getComponent().booleanCondition = false;
           fixture.detectChanges();
           expect(fixture.nativeElement).toHaveText('ELSE');
         }));

      it('should support dynamic else', async(() => {
           const template =
               '<span *ngIf="booleanCondition; else nestedBooleanCondition ? b1 : b2">TRUE</span>' +
               '<ng-template #b1>FALSE1</ng-template>' +
               '<ng-template #b2>FALSE2</ng-template>';

           fixture = createTestComponent(template);

           fixture.detectChanges();
           expect(fixture.nativeElement).toHaveText('TRUE');

           getComponent().booleanCondition = false;
           fixture.detectChanges();
           expect(fixture.nativeElement).toHaveText('FALSE1');

           getComponent().nestedBooleanCondition = false;
           fixture.detectChanges();
           expect(fixture.nativeElement).toHaveText('FALSE2');
         }));

      it('should support binding to variable using let', async(() => {
           const template = '<span *ngIf="booleanCondition; else elseBlock; let v">{{v}}</span>' +
               '<ng-template #elseBlock let-v>{{v}}</ng-template>';

           fixture = createTestComponent(template);

           fixture.detectChanges();
           expect(fixture.nativeElement).toHaveText('true');

           getComponent().booleanCondition = false;
           fixture.detectChanges();
           expect(fixture.nativeElement).toHaveText('false');
         }));

      it('should support binding to variable using as', async(() => {
           const template = '<span *ngIf="booleanCondition as v; else elseBlock">{{v}}</span>' +
               '<ng-template #elseBlock let-v>{{v}}</ng-template>';

           fixture = createTestComponent(template);

           fixture.detectChanges();
           expect(fixture.nativeElement).toHaveText('true');

           getComponent().booleanCondition = false;
           fixture.detectChanges();
           expect(fixture.nativeElement).toHaveText('false');
         }));
    });
  });
}

@Component({selector: 'test-cmp', template: ''})
class TestComponent {
  booleanCondition: boolean = true;
  nestedBooleanCondition: boolean = true;
  numberCondition: number = 1;
  stringCondition: string = 'foo';
  functionCondition: Function = (s: any, n: any): boolean => s == 'foo' && n == 1;
}

function createTestComponent(template: string): ComponentFixture<TestComponent> {
  return TestBed.overrideComponent(TestComponent, {set: {template: template}})
      .createComponent(TestComponent);
}
