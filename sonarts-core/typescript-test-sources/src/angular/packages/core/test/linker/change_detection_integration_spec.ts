/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementSchemaRegistry} from '@angular/compiler/src/schema/element_schema_registry';
import {TEST_COMPILER_PROVIDERS} from '@angular/compiler/testing/src/test_bindings';
import {AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, DebugElement, Directive, DoCheck, EventEmitter, HostBinding, Inject, Injectable, Input, OnChanges, OnDestroy, OnInit, Output, Pipe, PipeTransform, RenderComponentType, Renderer, RendererFactory2, RootRenderer, SimpleChange, SimpleChanges, TemplateRef, Type, ViewChild, ViewContainerRef, WrappedValue} from '@angular/core';
import {ComponentFixture, TestBed, fakeAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser/src/dom/debug/by';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {expect} from '@angular/platform-browser/testing/src/matchers';

import {DomElementSchemaRegistry} from '../../../compiler/index';
import {MockSchemaRegistry} from '../../../compiler/testing/index';

export function main() {
  let elSchema: MockSchemaRegistry;
  let renderLog: RenderLog;
  let directiveLog: DirectiveLog;

  function createCompFixture<T>(template: string): ComponentFixture<TestComponent>;
  function createCompFixture<T>(template: string, compType: Type<T>): ComponentFixture<T>;
  function createCompFixture<T>(
      template: string, compType: Type<T> = <any>TestComponent): ComponentFixture<T> {
    TestBed.overrideComponent(compType, {set: new Component({template})});

    initHelpers();

    return TestBed.createComponent(compType);
  }

  function initHelpers(): void {
    elSchema = TestBed.get(ElementSchemaRegistry);
    renderLog = TestBed.get(RenderLog);
    directiveLog = TestBed.get(DirectiveLog);
    elSchema.existingProperties['someProp'] = true;
    patchLoggingRenderer2(TestBed.get(RendererFactory2), renderLog);
  }

  function queryDirs(el: DebugElement, dirType: Type<any>): any {
    const nodes = el.queryAllNodes(By.directive(dirType));
    return nodes.map(node => node.injector.get(dirType));
  }

  function _bindSimpleProp<T>(bindAttr: string): ComponentFixture<TestComponent>;
  function _bindSimpleProp<T>(bindAttr: string, compType: Type<T>): ComponentFixture<T>;
  function _bindSimpleProp<T>(
      bindAttr: string, compType: Type<T> = <any>TestComponent): ComponentFixture<T> {
    const template = `<div ${bindAttr}></div>`;
    return createCompFixture(template, compType);
  }

  function _bindSimpleValue(expression: any): ComponentFixture<TestComponent>;
  function _bindSimpleValue<T>(expression: any, compType: Type<T>): ComponentFixture<T>;
  function _bindSimpleValue<T>(
      expression: any, compType: Type<T> = <any>TestComponent): ComponentFixture<T> {
    return _bindSimpleProp(`[someProp]='${expression}'`, compType);
  }

  function _bindAndCheckSimpleValue(
      expression: any, compType: Type<any> = TestComponent): string[] {
    const ctx = _bindSimpleValue(expression, compType);
    ctx.detectChanges(false);
    return renderLog.log;
  }

  describe(`ChangeDetection`, () => {
    // On CJS fakeAsync is not supported...
    if (!getDOM().supportsDOMEvents()) return;

    beforeEach(() => {
      TestBed.configureCompiler({providers: TEST_COMPILER_PROVIDERS});
      TestBed.configureTestingModule({
        declarations: [
          TestData,
          TestDirective,
          TestComponent,
          AnotherComponent,
          TestLocals,
          CompWithRef,
          WrapCompWithRef,
          EmitterDirective,
          PushComp,
          OnDestroyDirective,
          OrderCheckDirective2,
          OrderCheckDirective0,
          OrderCheckDirective1,
          Gh9882,
          Uninitialized,
          Person,
          PersonHolder,
          PersonHolderHolder,
          CountingPipe,
          CountingImpurePipe,
          MultiArgPipe,
          PipeWithOnDestroy,
          IdentityPipe,
          WrappedPipe,
        ],
        providers: [
          RenderLog,
          DirectiveLog,
        ],
      });
    });

    describe('expressions', () => {
      it('should support literals',
         fakeAsync(() => { expect(_bindAndCheckSimpleValue(10)).toEqual(['someProp=10']); }));

      it('should strip quotes from literals',
         fakeAsync(() => { expect(_bindAndCheckSimpleValue('"str"')).toEqual(['someProp=str']); }));

      it('should support newlines in literals', fakeAsync(() => {
           expect(_bindAndCheckSimpleValue('"a\n\nb"')).toEqual(['someProp=a\n\nb']);
         }));

      it('should support + operations',
         fakeAsync(() => { expect(_bindAndCheckSimpleValue('10 + 2')).toEqual(['someProp=12']); }));

      it('should support - operations',
         fakeAsync(() => { expect(_bindAndCheckSimpleValue('10 - 2')).toEqual(['someProp=8']); }));

      it('should support * operations',
         fakeAsync(() => { expect(_bindAndCheckSimpleValue('10 * 2')).toEqual(['someProp=20']); }));

      it('should support / operations', fakeAsync(() => {
           expect(_bindAndCheckSimpleValue('10 / 2')).toEqual([`someProp=${5.0}`]);
         }));  // dart exp=5.0, js exp=5

      it('should support % operations',
         fakeAsync(() => { expect(_bindAndCheckSimpleValue('11 % 2')).toEqual(['someProp=1']); }));

      it('should support == operations on identical', fakeAsync(() => {
           expect(_bindAndCheckSimpleValue('1 == 1')).toEqual(['someProp=true']);
         }));

      it('should support != operations', fakeAsync(() => {
           expect(_bindAndCheckSimpleValue('1 != 1')).toEqual(['someProp=false']);
         }));

      it('should support == operations on coerceible', fakeAsync(() => {
           expect(_bindAndCheckSimpleValue('1 == true')).toEqual([`someProp=true`]);
         }));

      it('should support === operations on identical', fakeAsync(() => {
           expect(_bindAndCheckSimpleValue('1 === 1')).toEqual(['someProp=true']);
         }));

      it('should support !== operations', fakeAsync(() => {
           expect(_bindAndCheckSimpleValue('1 !== 1')).toEqual(['someProp=false']);
         }));

      it('should support === operations on coerceible', fakeAsync(() => {
           expect(_bindAndCheckSimpleValue('1 === true')).toEqual(['someProp=false']);
         }));

      it('should support true < operations', fakeAsync(() => {
           expect(_bindAndCheckSimpleValue('1 < 2')).toEqual(['someProp=true']);
         }));

      it('should support false < operations', fakeAsync(() => {
           expect(_bindAndCheckSimpleValue('2 < 1')).toEqual(['someProp=false']);
         }));

      it('should support false > operations', fakeAsync(() => {
           expect(_bindAndCheckSimpleValue('1 > 2')).toEqual(['someProp=false']);
         }));

      it('should support true > operations', fakeAsync(() => {
           expect(_bindAndCheckSimpleValue('2 > 1')).toEqual(['someProp=true']);
         }));

      it('should support true <= operations', fakeAsync(() => {
           expect(_bindAndCheckSimpleValue('1 <= 2')).toEqual(['someProp=true']);
         }));

      it('should support equal <= operations', fakeAsync(() => {
           expect(_bindAndCheckSimpleValue('2 <= 2')).toEqual(['someProp=true']);
         }));

      it('should support false <= operations', fakeAsync(() => {
           expect(_bindAndCheckSimpleValue('2 <= 1')).toEqual(['someProp=false']);
         }));

      it('should support true >= operations', fakeAsync(() => {
           expect(_bindAndCheckSimpleValue('2 >= 1')).toEqual(['someProp=true']);
         }));

      it('should support equal >= operations', fakeAsync(() => {
           expect(_bindAndCheckSimpleValue('2 >= 2')).toEqual(['someProp=true']);
         }));

      it('should support false >= operations', fakeAsync(() => {
           expect(_bindAndCheckSimpleValue('1 >= 2')).toEqual(['someProp=false']);
         }));

      it('should support true && operations', fakeAsync(() => {
           expect(_bindAndCheckSimpleValue('true && true')).toEqual(['someProp=true']);
         }));

      it('should support false && operations', fakeAsync(() => {
           expect(_bindAndCheckSimpleValue('true && false')).toEqual(['someProp=false']);
         }));

      it('should support true || operations', fakeAsync(() => {
           expect(_bindAndCheckSimpleValue('true || false')).toEqual(['someProp=true']);
         }));

      it('should support false || operations', fakeAsync(() => {
           expect(_bindAndCheckSimpleValue('false || false')).toEqual(['someProp=false']);
         }));

      it('should support negate', fakeAsync(() => {
           expect(_bindAndCheckSimpleValue('!true')).toEqual(['someProp=false']);
         }));

      it('should support double negate', fakeAsync(() => {
           expect(_bindAndCheckSimpleValue('!!true')).toEqual(['someProp=true']);
         }));

      it('should support true conditionals', fakeAsync(() => {
           expect(_bindAndCheckSimpleValue('1 < 2 ? 1 : 2')).toEqual(['someProp=1']);
         }));

      it('should support false conditionals', fakeAsync(() => {
           expect(_bindAndCheckSimpleValue('1 > 2 ? 1 : 2')).toEqual(['someProp=2']);
         }));

      it('should support keyed access to a list item', fakeAsync(() => {
           expect(_bindAndCheckSimpleValue('["foo", "bar"][0]')).toEqual(['someProp=foo']);
         }));

      it('should support keyed access to a map item', fakeAsync(() => {
           expect(_bindAndCheckSimpleValue('{"foo": "bar"}["foo"]')).toEqual(['someProp=bar']);
         }));

      it('should report all changes on the first run including uninitialized values',
         fakeAsync(() => {
           expect(_bindAndCheckSimpleValue('value', Uninitialized)).toEqual(['someProp=null']);
         }));

      it('should report all changes on the first run including null values', fakeAsync(() => {
           const ctx = _bindSimpleValue('a', TestData);
           ctx.componentInstance.a = null;
           ctx.detectChanges(false);
           expect(renderLog.log).toEqual(['someProp=null']);
         }));

      it('should support simple chained property access', fakeAsync(() => {
           const ctx = _bindSimpleValue('address.city', Person);
           ctx.componentInstance.name = 'Victor';
           ctx.componentInstance.address = new Address('Grenoble');
           ctx.detectChanges(false);
           expect(renderLog.log).toEqual(['someProp=Grenoble']);
         }));

      describe('safe navigation operator', () => {
        it('should support reading properties of nulls', fakeAsync(() => {
             const ctx = _bindSimpleValue('address?.city', Person);
             ctx.componentInstance.address = null !;
             ctx.detectChanges(false);
             expect(renderLog.log).toEqual(['someProp=null']);
           }));

        it('should support calling methods on nulls', fakeAsync(() => {
             const ctx = _bindSimpleValue('address?.toString()', Person);
             ctx.componentInstance.address = null !;
             ctx.detectChanges(false);
             expect(renderLog.log).toEqual(['someProp=null']);
           }));

        it('should support reading properties on non nulls', fakeAsync(() => {
             const ctx = _bindSimpleValue('address?.city', Person);
             ctx.componentInstance.address = new Address('MTV');
             ctx.detectChanges(false);
             expect(renderLog.log).toEqual(['someProp=MTV']);
           }));

        it('should support calling methods on non nulls', fakeAsync(() => {
             const ctx = _bindSimpleValue('address?.toString()', Person);
             ctx.componentInstance.address = new Address('MTV');
             ctx.detectChanges(false);
             expect(renderLog.log).toEqual(['someProp=MTV']);
           }));

        it('should support short-circuting safe navigation', fakeAsync(() => {
             const ctx = _bindSimpleValue('value?.address.city', PersonHolder);
             ctx.componentInstance.value = null !;
             ctx.detectChanges(false);
             expect(renderLog.log).toEqual(['someProp=null']);
           }));

        it('should support nested short-circuting safe navigation', fakeAsync(() => {
             const ctx = _bindSimpleValue('value.value?.address.city', PersonHolderHolder);
             ctx.componentInstance.value = new PersonHolder();
             ctx.detectChanges(false);
             expect(renderLog.log).toEqual(['someProp=null']);
           }));

        it('should support chained short-circuting safe navigation', fakeAsync(() => {
             const ctx = _bindSimpleValue('value?.value?.address.city', PersonHolderHolder);
             ctx.detectChanges(false);
             expect(renderLog.log).toEqual(['someProp=null']);
           }));

        it('should support short-circuting array index operations', fakeAsync(() => {
             const ctx = _bindSimpleValue('value?.phones[0]', PersonHolder);
             ctx.detectChanges(false);
             expect(renderLog.log).toEqual(['someProp=null']);
           }));

        it('should still throw if right-side would throw', fakeAsync(() => {
             expect(() => {
               const ctx = _bindSimpleValue('value?.address.city', PersonHolder);
               const person = new Person();
               person.address = null !;
               ctx.componentInstance.value = person;
               ctx.detectChanges(false);
             }).toThrow();
           }));
      });

      it('should support method calls', fakeAsync(() => {
           const ctx = _bindSimpleValue('sayHi("Jim")', Person);
           ctx.detectChanges(false);
           expect(renderLog.log).toEqual(['someProp=Hi, Jim']);
         }));

      it('should support function calls', fakeAsync(() => {
           const ctx = _bindSimpleValue('a()(99)', TestData);
           ctx.componentInstance.a = () => (a: any) => a;
           ctx.detectChanges(false);
           expect(renderLog.log).toEqual(['someProp=99']);
         }));

      it('should support chained method calls', fakeAsync(() => {
           const ctx = _bindSimpleValue('address.toString()', Person);
           ctx.componentInstance.address = new Address('MTV');
           ctx.detectChanges(false);
           expect(renderLog.log).toEqual(['someProp=MTV']);
         }));

      it('should support NaN', fakeAsync(() => {
           const ctx = _bindSimpleValue('age', Person);
           ctx.componentInstance.age = NaN;
           ctx.detectChanges(false);

           expect(renderLog.log).toEqual(['someProp=NaN']);
           renderLog.clear();

           ctx.detectChanges(false);
           expect(renderLog.log).toEqual([]);
         }));

      it('should do simple watching', fakeAsync(() => {
           const ctx = _bindSimpleValue('name', Person);
           ctx.componentInstance.name = 'misko';

           ctx.detectChanges(false);
           expect(renderLog.log).toEqual(['someProp=misko']);
           renderLog.clear();

           ctx.detectChanges(false);
           expect(renderLog.log).toEqual([]);
           renderLog.clear();

           ctx.componentInstance.name = 'Misko';
           ctx.detectChanges(false);
           expect(renderLog.log).toEqual(['someProp=Misko']);
         }));

      it('should support literal array made of literals', fakeAsync(() => {
           const ctx = _bindSimpleValue('[1, 2]');
           ctx.detectChanges(false);
           expect(renderLog.loggedValues).toEqual([[1, 2]]);
         }));

      it('should support empty literal array', fakeAsync(() => {
           const ctx = _bindSimpleValue('[]');
           ctx.detectChanges(false);
           expect(renderLog.loggedValues).toEqual([[]]);
         }));

      it('should support literal array made of expressions', fakeAsync(() => {
           const ctx = _bindSimpleValue('[1, a]', TestData);
           ctx.componentInstance.a = 2;
           ctx.detectChanges(false);
           expect(renderLog.loggedValues).toEqual([[1, 2]]);
         }));

      it('should not recreate literal arrays unless their content changed', fakeAsync(() => {
           const ctx = _bindSimpleValue('[1, a]', TestData);
           ctx.componentInstance.a = 2;
           ctx.detectChanges(false);
           ctx.detectChanges(false);
           ctx.componentInstance.a = 3;
           ctx.detectChanges(false);
           ctx.detectChanges(false);
           expect(renderLog.loggedValues).toEqual([[1, 2], [1, 3]]);
         }));

      it('should support literal maps made of literals', fakeAsync(() => {
           const ctx = _bindSimpleValue('{z: 1}');
           ctx.detectChanges(false);
           expect(renderLog.loggedValues[0]['z']).toEqual(1);
         }));

      it('should support empty literal map', fakeAsync(() => {
           const ctx = _bindSimpleValue('{}');
           ctx.detectChanges(false);
           expect(renderLog.loggedValues).toEqual([{}]);
         }));

      it('should support literal maps made of expressions', fakeAsync(() => {
           const ctx = _bindSimpleValue('{z: a}');
           ctx.componentInstance.a = 1;
           ctx.detectChanges(false);
           expect(renderLog.loggedValues[0]['z']).toEqual(1);
         }));

      it('should not recreate literal maps unless their content changed', fakeAsync(() => {
           const ctx = _bindSimpleValue('{z: a}');
           ctx.componentInstance.a = 1;
           ctx.detectChanges(false);
           ctx.detectChanges(false);
           ctx.componentInstance.a = 2;
           ctx.detectChanges(false);
           ctx.detectChanges(false);
           expect(renderLog.loggedValues.length).toBe(2);
           expect(renderLog.loggedValues[0]['z']).toEqual(1);
           expect(renderLog.loggedValues[1]['z']).toEqual(2);
         }));


      it('should ignore empty bindings', fakeAsync(() => {
           const ctx = _bindSimpleProp('[someProp]', TestData);
           ctx.componentInstance.a = 'value';
           ctx.detectChanges(false);

           expect(renderLog.log).toEqual([]);
         }));

      it('should support interpolation', fakeAsync(() => {
           const ctx = _bindSimpleProp('someProp="B{{a}}A"', TestData);
           ctx.componentInstance.a = 'value';
           ctx.detectChanges(false);

           expect(renderLog.log).toEqual(['someProp=BvalueA']);
         }));

      it('should output empty strings for null values in interpolation', fakeAsync(() => {
           const ctx = _bindSimpleProp('someProp="B{{a}}A"', TestData);
           ctx.componentInstance.a = null;
           ctx.detectChanges(false);

           expect(renderLog.log).toEqual(['someProp=BA']);
         }));

      it('should escape values in literals that indicate interpolation',
         fakeAsync(() => { expect(_bindAndCheckSimpleValue('"$"')).toEqual(['someProp=$']); }));

      it('should read locals', fakeAsync(() => {
           const ctx = createCompFixture(
               '<ng-template testLocals let-local="someLocal">{{local}}</ng-template>');
           ctx.detectChanges(false);

           expect(renderLog.log).toEqual(['{{someLocalValue}}']);
         }));

      describe('pipes', () => {
        it('should use the return value of the pipe', fakeAsync(() => {
             const ctx = _bindSimpleValue('name | countingPipe', Person);
             ctx.componentInstance.name = 'bob';
             ctx.detectChanges(false);
             expect(renderLog.loggedValues).toEqual(['bob state:0']);
           }));

        it('should support arguments in pipes', fakeAsync(() => {
             const ctx = _bindSimpleValue('name | multiArgPipe:"one":address.city', Person);
             ctx.componentInstance.name = 'value';
             ctx.componentInstance.address = new Address('two');
             ctx.detectChanges(false);
             expect(renderLog.loggedValues).toEqual(['value one two default']);
           }));

        it('should associate pipes right-to-left', fakeAsync(() => {
             const ctx = _bindSimpleValue('name | multiArgPipe:"a":"b" | multiArgPipe:0:1', Person);
             ctx.componentInstance.name = 'value';
             ctx.detectChanges(false);
             expect(renderLog.loggedValues).toEqual(['value a b default 0 1 default']);
           }));

        it('should support calling pure pipes with different number of arguments', fakeAsync(() => {
             const ctx =
                 _bindSimpleValue('name | multiArgPipe:"a":"b" | multiArgPipe:0:1:2', Person);
             ctx.componentInstance.name = 'value';
             ctx.detectChanges(false);
             expect(renderLog.loggedValues).toEqual(['value a b default 0 1 2']);
           }));

        it('should do nothing when no change', fakeAsync(() => {
             const ctx = _bindSimpleValue('"Megatron" | identityPipe', Person);

             ctx.detectChanges(false);

             expect(renderLog.log).toEqual(['someProp=Megatron']);

             renderLog.clear();
             ctx.detectChanges(false);

             expect(renderLog.log).toEqual([]);
           }));

        it('should unwrap the wrapped value and force a change', fakeAsync(() => {
             const ctx = _bindSimpleValue('"Megatron" | wrappedPipe', Person);

             ctx.detectChanges(false);

             expect(renderLog.log).toEqual(['someProp=Megatron']);

             renderLog.clear();
             ctx.detectChanges(false);

             expect(renderLog.log).toEqual(['someProp=Megatron']);
           }));

        it('should record unwrapped values via ngOnChanges', fakeAsync(() => {
             const ctx = createCompFixture(
                 '<div [testDirective]="\'aName\' | wrappedPipe" [a]="1" [b]="2 | wrappedPipe"></div>');
             const dir: TestDirective = queryDirs(ctx.debugElement, TestDirective)[0];
             ctx.detectChanges(false);
             dir.changes = {};
             ctx.detectChanges(false);

             // Note: the binding for `b` did not change and has no ValueWrapper,
             // and should therefore stay unchanged.
             expect(dir.changes).toEqual({
               'name': new SimpleChange('aName', 'aName', false),
               'b': new SimpleChange(2, 2, false)
             });

             ctx.detectChanges(false);
             expect(dir.changes).toEqual({
               'name': new SimpleChange('aName', 'aName', false),
               'b': new SimpleChange(2, 2, false)
             });
           }));

        it('should call pure pipes only if the arguments change', fakeAsync(() => {
             const ctx = _bindSimpleValue('name | countingPipe', Person);
             // change from undefined -> null
             ctx.componentInstance.name = null !;
             ctx.detectChanges(false);
             expect(renderLog.loggedValues).toEqual(['null state:0']);
             ctx.detectChanges(false);
             expect(renderLog.loggedValues).toEqual(['null state:0']);

             // change from null -> some value
             ctx.componentInstance.name = 'bob';
             ctx.detectChanges(false);
             expect(renderLog.loggedValues).toEqual(['null state:0', 'bob state:1']);
             ctx.detectChanges(false);
             expect(renderLog.loggedValues).toEqual(['null state:0', 'bob state:1']);

             // change from some value -> some other value
             ctx.componentInstance.name = 'bart';
             ctx.detectChanges(false);
             expect(renderLog.loggedValues).toEqual([
               'null state:0', 'bob state:1', 'bart state:2'
             ]);
             ctx.detectChanges(false);
             expect(renderLog.loggedValues).toEqual([
               'null state:0', 'bob state:1', 'bart state:2'
             ]);

           }));

        it('should call pure pipes that are used multiple times only when the arguments change',
           fakeAsync(() => {
             const ctx = createCompFixture(
                 `<div [someProp]="name | countingPipe"></div><div [someProp]="age | countingPipe"></div>` +
                     '<div *ngFor="let x of [1,2]" [someProp]="address.city | countingPipe"></div>',
                 Person);
             ctx.componentInstance.name = 'a';
             ctx.componentInstance.age = 10;
             ctx.componentInstance.address = new Address('mtv');
             ctx.detectChanges(false);
             expect(renderLog.loggedValues).toEqual([
               'mtv state:0', 'mtv state:1', 'a state:2', '10 state:3'
             ]);
             ctx.detectChanges(false);
             expect(renderLog.loggedValues).toEqual([
               'mtv state:0', 'mtv state:1', 'a state:2', '10 state:3'
             ]);
             ctx.componentInstance.age = 11;
             ctx.detectChanges(false);
             expect(renderLog.loggedValues).toEqual([
               'mtv state:0', 'mtv state:1', 'a state:2', '10 state:3', '11 state:4'
             ]);
           }));

        it('should call impure pipes on each change detection run', fakeAsync(() => {
             const ctx = _bindSimpleValue('name | countingImpurePipe', Person);
             ctx.componentInstance.name = 'bob';
             ctx.detectChanges(false);
             expect(renderLog.loggedValues).toEqual(['bob state:0']);
             ctx.detectChanges(false);
             expect(renderLog.loggedValues).toEqual(['bob state:0', 'bob state:1']);
           }));
      });

      describe('event expressions', () => {
        it('should support field assignments', fakeAsync(() => {
             const ctx = _bindSimpleProp('(event)="b=a=$event"');
             const childEl = ctx.debugElement.children[0];
             const evt = 'EVENT';
             childEl.triggerEventHandler('event', evt);

             expect(ctx.componentInstance.a).toEqual(evt);
             expect(ctx.componentInstance.b).toEqual(evt);
           }));

        it('should support keyed assignments', fakeAsync(() => {
             const ctx = _bindSimpleProp('(event)="a[0]=$event"');
             const childEl = ctx.debugElement.children[0];
             ctx.componentInstance.a = ['OLD'];
             const evt = 'EVENT';
             childEl.triggerEventHandler('event', evt);
             expect(ctx.componentInstance.a).toEqual([evt]);
           }));

        it('should support chains', fakeAsync(() => {
             const ctx = _bindSimpleProp('(event)="a=a+1; a=a+1;"');
             const childEl = ctx.debugElement.children[0];
             ctx.componentInstance.a = 0;
             childEl.triggerEventHandler('event', 'EVENT');
             expect(ctx.componentInstance.a).toEqual(2);
           }));

        it('should support empty literals', fakeAsync(() => {
             const ctx = _bindSimpleProp('(event)="a=[{},[]]"');
             const childEl = ctx.debugElement.children[0];
             childEl.triggerEventHandler('event', 'EVENT');

             expect(ctx.componentInstance.a).toEqual([{}, []]);
           }));

        it('should throw when trying to assign to a local', fakeAsync(() => {
             expect(() => {
               _bindSimpleProp('(event)="$event=1"');
             }).toThrowError(new RegExp('Cannot assign to a reference or variable!'));
           }));

        it('should support short-circuiting', fakeAsync(() => {
             const ctx = _bindSimpleProp('(event)="true ? a = a + 1 : a = a + 1"');
             const childEl = ctx.debugElement.children[0];
             ctx.componentInstance.a = 0;
             childEl.triggerEventHandler('event', 'EVENT');
             expect(ctx.componentInstance.a).toEqual(1);
           }));
      });

    });

    describe('RendererFactory', () => {
      it('should call the begin and end methods on the renderer factory when change detection is called',
         fakeAsync(() => {
           const ctx = createCompFixture('<div testDirective [a]="42"></div>');
           const rf = TestBed.get(RendererFactory2);
           spyOn(rf, 'begin');
           spyOn(rf, 'end');
           expect(rf.begin).not.toHaveBeenCalled();
           expect(rf.end).not.toHaveBeenCalled();

           ctx.detectChanges(false);
           expect(rf.begin).toHaveBeenCalled();
           expect(rf.end).toHaveBeenCalled();
         }));
    });

    describe('change notification', () => {
      describe('updating directives', () => {
        it('should happen without invoking the renderer', fakeAsync(() => {
             const ctx = createCompFixture('<div testDirective [a]="42"></div>');
             ctx.detectChanges(false);
             expect(renderLog.log).toEqual([]);
             expect(queryDirs(ctx.debugElement, TestDirective)[0].a).toEqual(42);
           }));
      });

      describe('reading directives', () => {
        it('should read directive properties', fakeAsync(() => {
             const ctx = createCompFixture(
                 '<div testDirective [a]="42" ref-dir="testDirective" [someProp]="dir.a"></div>');
             ctx.detectChanges(false);
             expect(renderLog.loggedValues).toEqual([42]);
           }));
      });

      describe('ngOnChanges', () => {
        it('should notify the directive when a group of records changes', fakeAsync(() => {
             const ctx = createCompFixture(
                 '<div [testDirective]="\'aName\'" [a]="1" [b]="2"></div><div [testDirective]="\'bName\'" [a]="4"></div>');
             ctx.detectChanges(false);

             const dirs = <TestDirective[]>queryDirs(ctx.debugElement, TestDirective);
             expect(dirs[0].changes).toEqual({
               'a': new SimpleChange(undefined, 1, true),
               'b': new SimpleChange(undefined, 2, true),
               'name': new SimpleChange(undefined, 'aName', true)
             });
             expect(dirs[1].changes).toEqual({
               'a': new SimpleChange(undefined, 4, true),
               'name': new SimpleChange(undefined, 'bName', true)
             });
           }));
      });
    });

    describe('lifecycle', () => {
      function createCompWithContentAndViewChild(): ComponentFixture<any> {
        TestBed.overrideComponent(AnotherComponent, {
          set: new Component({
            selector: 'other-cmp',
            template: '<div testDirective="viewChild"></div>',
          })
        });

        return createCompFixture(
            '<div testDirective="parent"><div *ngIf="true" testDirective="contentChild"></div><other-cmp></other-cmp></div>',
            TestComponent);
      }

      describe('ngOnInit', () => {
        it('should be called after ngOnChanges', fakeAsync(() => {
             const ctx = createCompFixture('<div testDirective="dir"></div>');
             expect(directiveLog.filter(['ngOnInit', 'ngOnChanges'])).toEqual([]);

             ctx.detectChanges(false);

             expect(directiveLog.filter(['ngOnInit', 'ngOnChanges'])).toEqual([
               'dir.ngOnChanges', 'dir.ngOnInit'
             ]);
             directiveLog.clear();

             ctx.detectChanges(false);

             expect(directiveLog.filter(['ngOnInit'])).toEqual([]);
           }));

        it('should only be called only once', fakeAsync(() => {
             const ctx = createCompFixture('<div testDirective="dir"></div>');

             ctx.detectChanges(false);

             expect(directiveLog.filter(['ngOnInit'])).toEqual(['dir.ngOnInit']);

             // reset directives
             directiveLog.clear();

             // Verify that checking should not call them.
             ctx.checkNoChanges();

             expect(directiveLog.filter(['ngOnInit'])).toEqual([]);

             // re-verify that changes should not call them
             ctx.detectChanges(false);

             expect(directiveLog.filter(['ngOnInit'])).toEqual([]);
           }));

        it('should not call ngOnInit again if it throws', fakeAsync(() => {
             const ctx = createCompFixture('<div testDirective="dir" throwOn="ngOnInit"></div>');

             let errored = false;
             // First pass fails, but ngOnInit should be called.
             try {
               ctx.detectChanges(false);
             } catch (e) {
               expect(e.message).toBe('Boom!');
               errored = true;
             }
             expect(errored).toBe(true);

             expect(directiveLog.filter(['ngOnInit'])).toEqual(['dir.ngOnInit']);
             directiveLog.clear();

             // Second change detection also fails, but this time ngOnInit should not be called.
             try {
               ctx.detectChanges(false);
             } catch (e) {
               expect(e.message).toBe('Boom!');
               throw new Error('Second detectChanges() should not have called ngOnInit.');
             }
             expect(directiveLog.filter(['ngOnInit'])).toEqual([]);
           }));
      });

      describe('ngDoCheck', () => {
        it('should be called after ngOnInit', fakeAsync(() => {
             const ctx = createCompFixture('<div testDirective="dir"></div>');

             ctx.detectChanges(false);
             expect(directiveLog.filter(['ngDoCheck', 'ngOnInit'])).toEqual([
               'dir.ngOnInit', 'dir.ngDoCheck'
             ]);
           }));

        it('should be called on every detectChanges run, except for checkNoChanges',
           fakeAsync(() => {
             const ctx = createCompFixture('<div testDirective="dir"></div>');

             ctx.detectChanges(false);

             expect(directiveLog.filter(['ngDoCheck'])).toEqual(['dir.ngDoCheck']);

             // reset directives
             directiveLog.clear();

             // Verify that checking should not call them.
             ctx.checkNoChanges();

             expect(directiveLog.filter(['ngDoCheck'])).toEqual([]);

             // re-verify that changes are still detected
             ctx.detectChanges(false);

             expect(directiveLog.filter(['ngDoCheck'])).toEqual(['dir.ngDoCheck']);
           }));
      });

      describe('ngAfterContentInit', () => {
        it('should be called after processing the content children but before the view children',
           fakeAsync(() => {
             const ctx = createCompWithContentAndViewChild();
             ctx.detectChanges(false);

             expect(directiveLog.filter(['ngDoCheck', 'ngAfterContentInit'])).toEqual([
               'parent.ngDoCheck', 'contentChild.ngDoCheck', 'contentChild.ngAfterContentInit',
               'parent.ngAfterContentInit', 'viewChild.ngDoCheck', 'viewChild.ngAfterContentInit'
             ]);
           }));

        it('should only be called only once', fakeAsync(() => {
             const ctx = createCompFixture('<div testDirective="dir"></div>');

             ctx.detectChanges(false);

             expect(directiveLog.filter(['ngAfterContentInit'])).toEqual([
               'dir.ngAfterContentInit'
             ]);

             // reset directives
             directiveLog.clear();

             // Verify that checking should not call them.
             ctx.checkNoChanges();

             expect(directiveLog.filter(['ngAfterContentInit'])).toEqual([]);

             // re-verify that changes should not call them
             ctx.detectChanges(false);

             expect(directiveLog.filter(['ngAfterContentInit'])).toEqual([]);
           }));

        it('should not call ngAfterContentInit again if it throws', fakeAsync(() => {
             const ctx =
                 createCompFixture('<div testDirective="dir" throwOn="ngAfterContentInit"></div>');

             let errored = false;
             // First pass fails, but ngAfterContentInit should be called.
             try {
               ctx.detectChanges(false);
             } catch (e) {
               errored = true;
             }
             expect(errored).toBe(true);

             expect(directiveLog.filter(['ngAfterContentInit'])).toEqual([
               'dir.ngAfterContentInit'
             ]);
             directiveLog.clear();

             // Second change detection also fails, but this time ngAfterContentInit should not be
             // called.
             try {
               ctx.detectChanges(false);
             } catch (e) {
               throw new Error('Second detectChanges() should not have run detection.');
             }
             expect(directiveLog.filter(['ngAfterContentInit'])).toEqual([]);
           }));
      });

      describe('ngAfterContentChecked', () => {
        it('should be called after the content children but before the view children',
           fakeAsync(() => {
             const ctx = createCompWithContentAndViewChild();

             ctx.detectChanges(false);

             expect(directiveLog.filter(['ngDoCheck', 'ngAfterContentChecked'])).toEqual([
               'parent.ngDoCheck', 'contentChild.ngDoCheck', 'contentChild.ngAfterContentChecked',
               'parent.ngAfterContentChecked', 'viewChild.ngDoCheck',
               'viewChild.ngAfterContentChecked'
             ]);
           }));

        it('should be called on every detectChanges run, except for checkNoChanges',
           fakeAsync(() => {
             const ctx = createCompFixture('<div testDirective="dir"></div>');

             ctx.detectChanges(false);

             expect(directiveLog.filter(['ngAfterContentChecked'])).toEqual([
               'dir.ngAfterContentChecked'
             ]);

             // reset directives
             directiveLog.clear();

             // Verify that checking should not call them.
             ctx.checkNoChanges();

             expect(directiveLog.filter(['ngAfterContentChecked'])).toEqual([]);

             // re-verify that changes are still detected
             ctx.detectChanges(false);

             expect(directiveLog.filter(['ngAfterContentChecked'])).toEqual([
               'dir.ngAfterContentChecked'
             ]);
           }));

        it('should be called in reverse order so the child is always notified before the parent',
           fakeAsync(() => {
             const ctx = createCompFixture(
                 '<div testDirective="parent"><div testDirective="child"></div></div><div testDirective="sibling"></div>');

             ctx.detectChanges(false);

             expect(directiveLog.filter(['ngAfterContentChecked'])).toEqual([
               'child.ngAfterContentChecked', 'parent.ngAfterContentChecked',
               'sibling.ngAfterContentChecked'
             ]);
           }));
      });


      describe('ngAfterViewInit', () => {
        it('should be called after processing the view children', fakeAsync(() => {
             const ctx = createCompWithContentAndViewChild();

             ctx.detectChanges(false);

             expect(directiveLog.filter(['ngDoCheck', 'ngAfterViewInit'])).toEqual([
               'parent.ngDoCheck', 'contentChild.ngDoCheck', 'contentChild.ngAfterViewInit',
               'viewChild.ngDoCheck', 'viewChild.ngAfterViewInit', 'parent.ngAfterViewInit'
             ]);
           }));

        it('should only be called only once', fakeAsync(() => {
             const ctx = createCompFixture('<div testDirective="dir"></div>');

             ctx.detectChanges(false);

             expect(directiveLog.filter(['ngAfterViewInit'])).toEqual(['dir.ngAfterViewInit']);

             // reset directives
             directiveLog.clear();

             // Verify that checking should not call them.
             ctx.checkNoChanges();

             expect(directiveLog.filter(['ngAfterViewInit'])).toEqual([]);

             // re-verify that changes should not call them
             ctx.detectChanges(false);

             expect(directiveLog.filter(['ngAfterViewInit'])).toEqual([]);
           }));

        it('should not call ngAfterViewInit again if it throws', fakeAsync(() => {
             const ctx =
                 createCompFixture('<div testDirective="dir" throwOn="ngAfterViewInit"></div>');

             let errored = false;
             // First pass fails, but ngAfterViewInit should be called.
             try {
               ctx.detectChanges(false);
             } catch (e) {
               errored = true;
             }
             expect(errored).toBe(true);

             expect(directiveLog.filter(['ngAfterViewInit'])).toEqual(['dir.ngAfterViewInit']);
             directiveLog.clear();

             // Second change detection also fails, but this time ngAfterViewInit should not be
             // called.
             try {
               ctx.detectChanges(false);
             } catch (e) {
               throw new Error('Second detectChanges() should not have run detection.');
             }
             expect(directiveLog.filter(['ngAfterViewInit'])).toEqual([]);
           }));
      });

      describe('ngAfterViewChecked', () => {
        it('should be called after processing the view children', fakeAsync(() => {
             const ctx = createCompWithContentAndViewChild();

             ctx.detectChanges(false);

             expect(directiveLog.filter(['ngDoCheck', 'ngAfterViewChecked'])).toEqual([
               'parent.ngDoCheck', 'contentChild.ngDoCheck', 'contentChild.ngAfterViewChecked',
               'viewChild.ngDoCheck', 'viewChild.ngAfterViewChecked', 'parent.ngAfterViewChecked'
             ]);
           }));

        it('should be called on every detectChanges run, except for checkNoChanges',
           fakeAsync(() => {
             const ctx = createCompFixture('<div testDirective="dir"></div>');

             ctx.detectChanges(false);

             expect(directiveLog.filter(['ngAfterViewChecked'])).toEqual([
               'dir.ngAfterViewChecked'
             ]);

             // reset directives
             directiveLog.clear();

             // Verify that checking should not call them.
             ctx.checkNoChanges();

             expect(directiveLog.filter(['ngAfterViewChecked'])).toEqual([]);

             // re-verify that changes are still detected
             ctx.detectChanges(false);

             expect(directiveLog.filter(['ngAfterViewChecked'])).toEqual([
               'dir.ngAfterViewChecked'
             ]);
           }));

        it('should be called in reverse order so the child is always notified before the parent',
           fakeAsync(() => {
             const ctx = createCompFixture(
                 '<div testDirective="parent"><div testDirective="child"></div></div><div testDirective="sibling"></div>');

             ctx.detectChanges(false);

             expect(directiveLog.filter(['ngAfterViewChecked'])).toEqual([
               'child.ngAfterViewChecked', 'parent.ngAfterViewChecked', 'sibling.ngAfterViewChecked'
             ]);
           }));
      });

      describe('ngOnDestroy', () => {
        it('should be called on view destruction', fakeAsync(() => {
             const ctx = createCompFixture('<div testDirective="dir"></div>');
             ctx.detectChanges(false);

             ctx.destroy();

             expect(directiveLog.filter(['ngOnDestroy'])).toEqual(['dir.ngOnDestroy']);
           }));

        it('should be called after processing the content and view children', fakeAsync(() => {
             TestBed.overrideComponent(AnotherComponent, {
               set: new Component(
                   {selector: 'other-cmp', template: '<div testDirective="viewChild"></div>'})
             });

             const ctx = createCompFixture(
                 '<div testDirective="parent"><div *ngFor="let x of [0,1]" testDirective="contentChild{{x}}"></div>' +
                     '<other-cmp></other-cmp></div>',
                 TestComponent);

             ctx.detectChanges(false);
             ctx.destroy();

             expect(directiveLog.filter(['ngOnDestroy'])).toEqual([
               'contentChild0.ngOnDestroy', 'contentChild1.ngOnDestroy', 'viewChild.ngOnDestroy',
               'parent.ngOnDestroy'
             ]);
           }));

        it('should be called in reverse order so the child is always notified before the parent',
           fakeAsync(() => {
             const ctx = createCompFixture(
                 '<div testDirective="parent"><div testDirective="child"></div></div><div testDirective="sibling"></div>');

             ctx.detectChanges(false);
             ctx.destroy();

             expect(directiveLog.filter(['ngOnDestroy'])).toEqual([
               'child.ngOnDestroy', 'parent.ngOnDestroy', 'sibling.ngOnDestroy'
             ]);
           }));

        it('should deliver synchronous events to parent', fakeAsync(() => {
             const ctx = createCompFixture('<div (destroy)="a=$event" onDestroyDirective></div>');

             ctx.detectChanges(false);
             ctx.destroy();

             expect(ctx.componentInstance.a).toEqual('destroyed');
           }));

        it('should call ngOnDestroy on pipes', fakeAsync(() => {
             const ctx = createCompFixture('{{true | pipeWithOnDestroy }}');

             ctx.detectChanges(false);
             ctx.destroy();

             expect(directiveLog.filter(['ngOnDestroy'])).toEqual([
               'pipeWithOnDestroy.ngOnDestroy'
             ]);
           }));

        it('should call ngOnDestroy on an injectable class', fakeAsync(() => {
             TestBed.overrideDirective(
                 TestDirective, {set: {providers: [InjectableWithLifecycle]}});

             const ctx = createCompFixture('<div testDirective="dir"></div>', TestComponent);

             ctx.debugElement.children[0].injector.get(InjectableWithLifecycle);
             ctx.detectChanges(false);

             ctx.destroy();

             // We don't care about the exact order in this test.
             expect(directiveLog.filter(['ngOnDestroy']).sort()).toEqual([
               'dir.ngOnDestroy', 'injectable.ngOnDestroy'
             ]);
           }));
      });

    });

    describe('enforce no new changes', () => {
      it('should throw when a record gets changed after it has been checked', fakeAsync(() => {
           const ctx = createCompFixture('<div [someProp]="a"></div>', TestData);
           ctx.componentInstance.a = 1;

           expect(() => ctx.checkNoChanges())
               .toThrowError(/Expression has changed after it was checked./g);
         }));

      it('should warn when the view has been created in a cd hook', fakeAsync(() => {
           const ctx = createCompFixture('<div *gh9882>{{ a }}</div>', TestData);
           ctx.componentInstance.a = 1;
           expect(() => ctx.detectChanges())
               .toThrowError(
                   /It seems like the view has been created after its parent and its children have been dirty checked/);
         }));

      it('should not throw when two arrays are structurally the same', fakeAsync(() => {
           const ctx = _bindSimpleValue('a', TestData);
           ctx.componentInstance.a = ['value'];
           ctx.detectChanges(false);
           ctx.componentInstance.a = ['value'];
           expect(() => ctx.checkNoChanges()).not.toThrow();
         }));

      it('should not break the next run', fakeAsync(() => {
           const ctx = _bindSimpleValue('a', TestData);
           ctx.componentInstance.a = 'value';
           expect(() => ctx.checkNoChanges()).toThrow();

           ctx.detectChanges();
           expect(renderLog.loggedValues).toEqual(['value']);
         }));
    });

    describe('mode', () => {
      it('Detached', fakeAsync(() => {
           const ctx = createCompFixture('<comp-with-ref></comp-with-ref>');
           const cmp: CompWithRef = queryDirs(ctx.debugElement, CompWithRef)[0];
           cmp.value = 'hello';
           cmp.changeDetectorRef.detach();

           ctx.detectChanges();

           expect(renderLog.log).toEqual([]);
         }));

      it('Detached should disable OnPush', fakeAsync(() => {
           const ctx = createCompFixture('<push-cmp [value]="value"></push-cmp>');
           ctx.componentInstance.value = 0;
           ctx.detectChanges();
           renderLog.clear();

           const cmp: CompWithRef = queryDirs(ctx.debugElement, PushComp)[0];
           cmp.changeDetectorRef.detach();

           ctx.componentInstance.value = 1;
           ctx.detectChanges();

           expect(renderLog.log).toEqual([]);
         }));

      it('Detached view can be checked locally', fakeAsync(() => {
           const ctx = createCompFixture('<wrap-comp-with-ref></wrap-comp-with-ref>');
           const cmp: CompWithRef = queryDirs(ctx.debugElement, CompWithRef)[0];
           cmp.value = 'hello';
           cmp.changeDetectorRef.detach();
           expect(renderLog.log).toEqual([]);

           ctx.detectChanges();

           expect(renderLog.log).toEqual([]);

           cmp.changeDetectorRef.detectChanges();

           expect(renderLog.log).toEqual(['{{hello}}']);
         }));


      it('Reattaches', fakeAsync(() => {
           const ctx = createCompFixture('<comp-with-ref></comp-with-ref>');
           const cmp: CompWithRef = queryDirs(ctx.debugElement, CompWithRef)[0];

           cmp.value = 'hello';
           cmp.changeDetectorRef.detach();

           ctx.detectChanges();

           expect(renderLog.log).toEqual([]);

           cmp.changeDetectorRef.reattach();

           ctx.detectChanges();

           expect(renderLog.log).toEqual(['{{hello}}']);

         }));

      it('Reattaches in the original cd mode', fakeAsync(() => {
           const ctx = createCompFixture('<push-cmp></push-cmp>');
           const cmp: PushComp = queryDirs(ctx.debugElement, PushComp)[0];
           cmp.changeDetectorRef.detach();
           cmp.changeDetectorRef.reattach();

           // renderCount should NOT be incremented with each CD as CD mode should be resetted to
           // on-push
           ctx.detectChanges();
           expect(cmp.renderCount).toBeGreaterThan(0);
           const count = cmp.renderCount;

           ctx.detectChanges();
           expect(cmp.renderCount).toBe(count);
         }));

    });

    describe('multi directive order', () => {
      it('should follow the DI order for the same element', fakeAsync(() => {
           const ctx =
               createCompFixture('<div orderCheck2="2" orderCheck0="0" orderCheck1="1"></div>');

           ctx.detectChanges(false);
           ctx.destroy();

           expect(directiveLog.filter(['set'])).toEqual(['0.set', '1.set', '2.set']);
         }));
    });

    describe('nested view recursion', () => {
      it('should recurse into nested components even if there are no bindings in the component view',
         () => {
           @Component({selector: 'nested', template: '{{name}}'})
           class Nested {
             name = 'Tom';
           }

           TestBed.configureTestingModule({declarations: [Nested]});

           const ctx = createCompFixture('<nested></nested>');
           ctx.detectChanges();
           expect(renderLog.loggedValues).toEqual(['Tom']);
         });

      it('should recurse into nested view containers even if there are no bindings in the component view',
         () => {
           @Component({template: '<ng-template #vc>{{name}}</ng-template>'})
           class Comp {
             name = 'Tom';
             @ViewChild('vc', {read: ViewContainerRef}) vc: ViewContainerRef;
             @ViewChild(TemplateRef) template: TemplateRef<any>;
           }

           TestBed.configureTestingModule({declarations: [Comp]});
           initHelpers();

           const ctx = TestBed.createComponent(Comp);
           ctx.detectChanges();
           expect(renderLog.loggedValues).toEqual([]);

           ctx.componentInstance.vc.createEmbeddedView(ctx.componentInstance.template);
           ctx.detectChanges();
           expect(renderLog.loggedValues).toEqual(['Tom']);
         });

      describe('projected views', () => {
        let log: string[];

        @Directive({selector: '[i]'})
        class DummyDirective {
          @Input()
          i: any;
        }

        @Component({
          selector: 'main-cmp',
          template:
              `<span [i]="log('start')"></span><outer-cmp><ng-template><span [i]="log('tpl')"></span></ng-template></outer-cmp>`
        })
        class MainComp {
          constructor(public cdRef: ChangeDetectorRef) {}
          log(id: string) { log.push(`main-${id}`); }
        }

        @Component({
          selector: 'outer-cmp',
          template:
              `<span [i]="log('start')"></span><inner-cmp [outerTpl]="tpl"><ng-template><span [i]="log('tpl')"></span></ng-template></inner-cmp>`
        })
        class OuterComp {
          @ContentChild(TemplateRef)
          tpl: TemplateRef<any>;

          constructor(public cdRef: ChangeDetectorRef) {}
          log(id: string) { log.push(`outer-${id}`); }
        }

        @Component({
          selector: 'inner-cmp',
          template:
              `<span [i]="log('start')"></span>><ng-container [ngTemplateOutlet]="outerTpl"></ng-container><ng-container [ngTemplateOutlet]="tpl"></ng-container>`
        })
        class InnerComp {
          @ContentChild(TemplateRef)
          tpl: TemplateRef<any>;

          @Input()
          outerTpl: TemplateRef<any>

          constructor(public cdRef: ChangeDetectorRef) {}
          log(id: string) { log.push(`inner-${id}`); }
        }

        let ctx: ComponentFixture<MainComp>;
        let mainComp: MainComp;
        let outerComp: OuterComp;
        let innerComp: InnerComp;

        beforeEach(() => {
          log = [];
          ctx = TestBed
                    .configureTestingModule(
                        {declarations: [MainComp, OuterComp, InnerComp, DummyDirective]})
                    .createComponent(MainComp);
          mainComp = ctx.componentInstance;
          outerComp = ctx.debugElement.query(By.directive(OuterComp)).injector.get(OuterComp);
          innerComp = ctx.debugElement.query(By.directive(InnerComp)).injector.get(InnerComp);
        });

        it('should dirty check projected views in regular order', () => {
          ctx.detectChanges(false);
          expect(log).toEqual(
              ['main-start', 'outer-start', 'inner-start', 'main-tpl', 'outer-tpl']);

          log = [];
          ctx.detectChanges(false);
          expect(log).toEqual(
              ['main-start', 'outer-start', 'inner-start', 'main-tpl', 'outer-tpl']);
        });

        it('should not dirty check projected views if neither the declaration nor the insertion place is dirty checked',
           () => {
             ctx.detectChanges(false);
             log = [];
             mainComp.cdRef.detach();
             ctx.detectChanges(false);

             expect(log).toEqual([]);
           });

        it('should dirty check projected views if the insertion place is dirty checked', () => {
          ctx.detectChanges(false);
          log = [];

          innerComp.cdRef.detectChanges();
          expect(log).toEqual(['inner-start', 'main-tpl', 'outer-tpl']);
        });

        it('should dirty check projected views if the declaration place is dirty checked', () => {
          ctx.detectChanges(false);
          log = [];
          innerComp.cdRef.detach();
          mainComp.cdRef.detectChanges();

          expect(log).toEqual(['main-start', 'outer-start', 'main-tpl', 'outer-tpl']);

          log = [];
          outerComp.cdRef.detectChanges();

          expect(log).toEqual(['outer-start', 'outer-tpl']);

          log = [];
          outerComp.cdRef.detach();
          mainComp.cdRef.detectChanges();

          expect(log).toEqual(['main-start', 'main-tpl']);
        });
      });
    });

    describe('class binding', () => {
      it('should coordinate class attribute and class host binding', () => {
        @Component({template: `<div class="{{initClasses}}" someDir></div>`})
        class Comp {
          initClasses = 'init';
        }

        @Directive({selector: '[someDir]'})
        class SomeDir {
          @HostBinding('class.foo')
          fooClass = true;
        }

        const ctx =
            TestBed
                .configureCompiler({
                  providers:
                      [{provide: ElementSchemaRegistry, useExisting: DomElementSchemaRegistry}]
                })
                .configureTestingModule({declarations: [Comp, SomeDir]})
                .createComponent(Comp);

        ctx.detectChanges();

        const divEl = ctx.debugElement.children[0];
        expect(divEl.nativeElement).toHaveCssClass('init');
        expect(divEl.nativeElement).toHaveCssClass('foo');
      });
    });
  });
}

@Injectable()
class RenderLog {
  log: string[] = [];
  loggedValues: any[] = [];

  setElementProperty(el: any, propName: string, propValue: any) {
    this.log.push(`${propName}=${propValue}`);
    this.loggedValues.push(propValue);
  }

  setText(node: any, value: string) {
    this.log.push(`{{${value}}}`);
    this.loggedValues.push(value);
  }

  clear() {
    this.log = [];
    this.loggedValues = [];
  }
}

class DirectiveLogEntry {
  constructor(public directiveName: string, public method: string) {}
}

function patchLoggingRenderer2(rendererFactory: RendererFactory2, log: RenderLog) {
  if ((<any>rendererFactory).__patchedForLogging) {
    return;
  }
  (<any>rendererFactory).__patchedForLogging = true;
  const origCreateRenderer = rendererFactory.createRenderer;
  rendererFactory.createRenderer = function() {
    const renderer = origCreateRenderer.apply(this, arguments);
    if ((<any>renderer).__patchedForLogging) {
      return renderer;
    }
    (<any>renderer).__patchedForLogging = true;
    const origSetProperty = renderer.setProperty;
    const origSetValue = renderer.setValue;
    renderer.setProperty = function(el: any, name: string, value: any): void {
      log.setElementProperty(el, name, value);
      origSetProperty.call(renderer, el, name, value);
    };
    renderer.setValue = function(node: any, value: string): void {
      if (getDOM().isTextNode(node)) {
        log.setText(node, value);
      }
      origSetValue.call(renderer, node, value);
    };
    return renderer;
  };
}

@Injectable()
class DirectiveLog {
  entries: DirectiveLogEntry[] = [];

  add(directiveName: string, method: string) {
    this.entries.push(new DirectiveLogEntry(directiveName, method));
  }

  clear() { this.entries = []; }

  filter(methods: string[]): string[] {
    return this.entries.filter((entry) => methods.indexOf(entry.method) !== -1)
        .map(entry => `${entry.directiveName}.${entry.method}`);
  }
}


@Pipe({name: 'countingPipe'})
class CountingPipe implements PipeTransform {
  state: number = 0;
  transform(value: any) { return `${value} state:${this.state ++}`; }
}

@Pipe({name: 'countingImpurePipe', pure: false})
class CountingImpurePipe implements PipeTransform {
  state: number = 0;
  transform(value: any) { return `${value} state:${this.state ++}`; }
}

@Pipe({name: 'pipeWithOnDestroy'})
class PipeWithOnDestroy implements PipeTransform, OnDestroy {
  constructor(private directiveLog: DirectiveLog) {}

  ngOnDestroy() { this.directiveLog.add('pipeWithOnDestroy', 'ngOnDestroy'); }

  transform(value: any): any { return null; }
}

@Pipe({name: 'identityPipe'})
class IdentityPipe implements PipeTransform {
  transform(value: any) { return value; }
}

@Pipe({name: 'wrappedPipe'})
class WrappedPipe implements PipeTransform {
  transform(value: any) { return WrappedValue.wrap(value); }
}

@Pipe({name: 'multiArgPipe'})
class MultiArgPipe implements PipeTransform {
  transform(value: any, arg1: any, arg2: any, arg3 = 'default') {
    return `${value} ${arg1} ${arg2} ${arg3}`;
  }
}

@Component({selector: 'test-cmp', template: 'empty'})
class TestComponent {
  value: any;
  a: any;
  b: any;
}

@Component({selector: 'other-cmp', template: 'empty'})
class AnotherComponent {
}

@Component({
  selector: 'comp-with-ref',
  template: '<div (event)="noop()" emitterDirective></div>{{value}}',
  host: {'event': 'noop()'}
})
class CompWithRef {
  @Input() public value: any;

  constructor(public changeDetectorRef: ChangeDetectorRef) {}

  noop() {}
}

@Component({selector: 'wrap-comp-with-ref', template: '<comp-with-ref></comp-with-ref>'})
class WrapCompWithRef {
  constructor(public changeDetectorRef: ChangeDetectorRef) {}
}

@Component({
  selector: 'push-cmp',
  template: '<div (event)="noop()" emitterDirective></div>{{value}}{{renderIncrement}}',
  host: {'(event)': 'noop()'},
  changeDetection: ChangeDetectionStrategy.OnPush
})
class PushComp {
  @Input() public value: any;
  public renderCount: any = 0;

  get renderIncrement() {
    this.renderCount++;
    return '';
  }

  constructor(public changeDetectorRef: ChangeDetectorRef) {}

  noop() {}
}

@Directive({selector: '[emitterDirective]'})
class EmitterDirective {
  @Output('event') emitter = new EventEmitter<string>();
}

@Directive({selector: '[gh9882]'})
class Gh9882 implements AfterContentInit {
  constructor(private _viewContainer: ViewContainerRef, private _templateRef: TemplateRef<Object>) {
  }

  ngAfterContentInit(): any { this._viewContainer.createEmbeddedView(this._templateRef); }
}

@Directive({selector: '[testDirective]', exportAs: 'testDirective'})
class TestDirective implements OnInit, DoCheck, OnChanges, AfterContentInit, AfterContentChecked,
    AfterViewInit, AfterViewChecked, OnDestroy {
  @Input() a: any;
  @Input() b: any;
  changes: SimpleChanges;
  event: any;
  eventEmitter: EventEmitter<string> = new EventEmitter<string>();

  @Input('testDirective') name: string;

  @Input() throwOn: string;

  constructor(public log: DirectiveLog) {}

  onEvent(event: any) { this.event = event; }

  ngDoCheck() { this.log.add(this.name, 'ngDoCheck'); }

  ngOnInit() {
    this.log.add(this.name, 'ngOnInit');
    if (this.throwOn == 'ngOnInit') {
      throw new Error('Boom!');
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.log.add(this.name, 'ngOnChanges');
    this.changes = changes;
    if (this.throwOn == 'ngOnChanges') {
      throw new Error('Boom!');
    }
  }

  ngAfterContentInit() {
    this.log.add(this.name, 'ngAfterContentInit');
    if (this.throwOn == 'ngAfterContentInit') {
      throw new Error('Boom!');
    }
  }

  ngAfterContentChecked() {
    this.log.add(this.name, 'ngAfterContentChecked');
    if (this.throwOn == 'ngAfterContentChecked') {
      throw new Error('Boom!');
    }
  }

  ngAfterViewInit() {
    this.log.add(this.name, 'ngAfterViewInit');
    if (this.throwOn == 'ngAfterViewInit') {
      throw new Error('Boom!');
    }
  }

  ngAfterViewChecked() {
    this.log.add(this.name, 'ngAfterViewChecked');
    if (this.throwOn == 'ngAfterViewChecked') {
      throw new Error('Boom!');
    }
  }

  ngOnDestroy() {
    this.log.add(this.name, 'ngOnDestroy');
    if (this.throwOn == 'ngOnDestroy') {
      throw new Error('Boom!');
    }
  }
}

@Injectable()
class InjectableWithLifecycle {
  name = 'injectable';
  constructor(public log: DirectiveLog) {}

  ngOnDestroy() { this.log.add(this.name, 'ngOnDestroy'); }
}

@Directive({selector: '[onDestroyDirective]'})
class OnDestroyDirective implements OnDestroy {
  @Output('destroy') emitter = new EventEmitter<string>(false);

  ngOnDestroy() { this.emitter.emit('destroyed'); }
}

@Directive({selector: '[orderCheck0]'})
class OrderCheckDirective0 {
  private _name: string;

  @Input('orderCheck0')
  set name(value: string) {
    this._name = value;
    this.log.add(this._name, 'set');
  }

  constructor(public log: DirectiveLog) {}
}

@Directive({selector: '[orderCheck1]'})
class OrderCheckDirective1 {
  private _name: string;

  @Input('orderCheck1')
  set name(value: string) {
    this._name = value;
    this.log.add(this._name, 'set');
  }

  constructor(public log: DirectiveLog, _check0: OrderCheckDirective0) {}
}

@Directive({selector: '[orderCheck2]'})
class OrderCheckDirective2 {
  private _name: string;

  @Input('orderCheck2')
  set name(value: string) {
    this._name = value;
    this.log.add(this._name, 'set');
  }

  constructor(public log: DirectiveLog, _check1: OrderCheckDirective1) {}
}

class TestLocalsContext {
  constructor(public someLocal: string) {}
}

@Directive({selector: '[testLocals]'})
class TestLocals {
  constructor(templateRef: TemplateRef<TestLocalsContext>, vcRef: ViewContainerRef) {
    vcRef.createEmbeddedView(templateRef, new TestLocalsContext('someLocalValue'));
  }
}

@Component({selector: 'root', template: 'emtpy'})
class Person {
  age: number;
  name: string;
  address: Address|null = null;
  phones: number[];

  init(name: string, address: Address|null = null) {
    this.name = name;
    this.address = address;
  }

  sayHi(m: any): string { return `Hi, ${m}`; }

  passThrough(val: any): any { return val; }

  toString(): string {
    const address = this.address == null ? '' : ' address=' + this.address.toString();

    return 'name=' + this.name + address;
  }
}

class Address {
  cityGetterCalls: number = 0;
  zipCodeGetterCalls: number = 0;

  constructor(public _city: string, public _zipcode: any = null) {}

  get city() {
    this.cityGetterCalls++;
    return this._city;
  }

  get zipcode() {
    this.zipCodeGetterCalls++;
    return this._zipcode;
  }

  set city(v) { this._city = v; }

  set zipcode(v) { this._zipcode = v; }

  toString(): string { return this.city || '-'; }
}

@Component({selector: 'root', template: 'empty'})
class Uninitialized {
  value: any = null;
}

@Component({selector: 'root', template: 'empty'})
class TestData {
  public a: any;
}

@Component({selector: 'root', template: 'empty'})
class TestDataWithGetter {
  public fn: Function;

  get a() { return this.fn(); }
}

class Holder<T> {
  value: T;
}

@Component({selector: 'root', template: 'empty'})
class PersonHolder extends Holder<Person> {
}

@Component({selector: 'root', template: 'empty'})
class PersonHolderHolder extends Holder<Holder<Person>> {
}
