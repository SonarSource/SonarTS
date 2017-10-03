/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticReflector, StaticSymbol, StaticSymbolCache, StaticSymbolResolver, StaticSymbolResolverHost} from '@angular/compiler';
import {HostListener, Inject, animate, group, keyframes, sequence, state, style, transition, trigger} from '@angular/core';
import {CollectorOptions} from '@angular/tsc-wrapped';

import {MockStaticSymbolResolverHost, MockSummaryResolver} from './static_symbol_resolver_spec';

describe('StaticReflector', () => {
  let noContext: StaticSymbol;
  let host: StaticSymbolResolverHost;
  let symbolResolver: StaticSymbolResolver;
  let reflector: StaticReflector;

  function init(
      testData: {[key: string]: any} = DEFAULT_TEST_DATA,
      decorators: {name: string, filePath: string, ctor: any}[] = [],
      errorRecorder?: (error: any, fileName: string) => void, collectorOptions?: CollectorOptions) {
    const symbolCache = new StaticSymbolCache();
    host = new MockStaticSymbolResolverHost(testData, collectorOptions);
    const summaryResolver = new MockSummaryResolver([]);
    spyOn(summaryResolver, 'isLibraryFile').and.returnValue(false);
    symbolResolver = new StaticSymbolResolver(host, symbolCache, summaryResolver, errorRecorder);
    reflector = new StaticReflector(summaryResolver, symbolResolver, decorators, [], errorRecorder);
    noContext = reflector.getStaticSymbol('', '');
  }

  beforeEach(() => init());

  function simplify(context: StaticSymbol, value: any) {
    return reflector.simplify(context, value);
  }

  it('should get annotations for NgFor', () => {
    const NgFor = reflector.findDeclaration('@angular/common/src/directives/ng_for', 'NgFor');
    const annotations = reflector.annotations(NgFor);
    expect(annotations.length).toEqual(1);
    const annotation = annotations[0];
    expect(annotation.selector).toEqual('[ngFor][ngForOf]');
    expect(annotation.inputs).toEqual(['ngForTrackBy', 'ngForOf', 'ngForTemplate']);
  });

  it('should get constructor for NgFor', () => {
    const NgFor = reflector.findDeclaration('@angular/common/src/directives/ng_for', 'NgFor');
    const ViewContainerRef = reflector.findDeclaration('@angular/core', 'ViewContainerRef');
    const TemplateRef = reflector.findDeclaration('@angular/core', 'TemplateRef');
    const IterableDiffers = reflector.findDeclaration('@angular/core', 'IterableDiffers');
    const ChangeDetectorRef = reflector.findDeclaration('@angular/core', 'ChangeDetectorRef');

    const parameters = reflector.parameters(NgFor);
    expect(parameters).toEqual([
      [ViewContainerRef], [TemplateRef], [IterableDiffers], [ChangeDetectorRef]
    ]);
  });

  it('should get annotations for HeroDetailComponent', () => {
    const HeroDetailComponent =
        reflector.findDeclaration('src/app/hero-detail.component', 'HeroDetailComponent');
    const annotations = reflector.annotations(HeroDetailComponent);
    expect(annotations.length).toEqual(1);
    const annotation = annotations[0];
    expect(annotation.selector).toEqual('my-hero-detail');
    expect(annotation.animations).toEqual([trigger('myAnimation', [
      state('state1', style({'background': 'white'})),
      transition(
          '* => *',
          sequence([group([animate(
              '1s 0.5s',
              keyframes([style({'background': 'blue'}), style({'background': 'red'})]))])]))
    ])]);
  });

  it('should get and empty annotation list for an unknown class', () => {
    const UnknownClass = reflector.findDeclaration('src/app/app.component', 'UnknownClass');
    const annotations = reflector.annotations(UnknownClass);
    expect(annotations).toEqual([]);
  });

  it('should get and empty annotation list for a symbol with null value', () => {
    init({
      '/tmp/test.ts': `
        export var x = null;
      `
    });
    const annotations = reflector.annotations(reflector.getStaticSymbol('/tmp/test.ts', 'x'));
    expect(annotations).toEqual([]);
  });

  it('should get propMetadata for HeroDetailComponent', () => {
    const HeroDetailComponent =
        reflector.findDeclaration('src/app/hero-detail.component', 'HeroDetailComponent');
    const props = reflector.propMetadata(HeroDetailComponent);
    expect(props['hero']).toBeTruthy();
    expect(props['onMouseOver']).toEqual([new HostListener('mouseover', ['$event'])]);
  });

  it('should get an empty object from propMetadata for an unknown class', () => {
    const UnknownClass = reflector.findDeclaration('src/app/app.component', 'UnknownClass');
    const properties = reflector.propMetadata(UnknownClass);
    expect(properties).toEqual({});
  });

  it('should get empty parameters list for an unknown class ', () => {
    const UnknownClass = reflector.findDeclaration('src/app/app.component', 'UnknownClass');
    const parameters = reflector.parameters(UnknownClass);
    expect(parameters).toEqual([]);
  });

  it('should provide context for errors reported by the collector', () => {
    const SomeClass = reflector.findDeclaration('src/error-reporting', 'SomeClass');
    expect(() => reflector.annotations(SomeClass))
        .toThrow(new Error(
            'Error encountered resolving symbol values statically. A reasonable error message (position 13:34 in the original .ts file), resolving symbol ErrorSym in /tmp/src/error-references.d.ts, resolving symbol Link2 in /tmp/src/error-references.d.ts, resolving symbol Link1 in /tmp/src/error-references.d.ts, resolving symbol SomeClass in /tmp/src/error-reporting.d.ts, resolving symbol SomeClass in /tmp/src/error-reporting.d.ts'));
  });

  it('should simplify primitive into itself', () => {
    expect(simplify(noContext, 1)).toBe(1);
    expect(simplify(noContext, true)).toBe(true);
    expect(simplify(noContext, 'some value')).toBe('some value');
  });

  it('should simplify a static symbol into itself', () => {
    const staticSymbol = reflector.getStaticSymbol('', '');
    expect(simplify(noContext, staticSymbol)).toBe(staticSymbol);
  });

  it('should simplify an array into a copy of the array', () => {
    expect(simplify(noContext, [1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('should simplify an object to a copy of the object', () => {
    const expr = {a: 1, b: 2, c: 3};
    expect(simplify(noContext, expr)).toEqual(expr);
  });

  it('should simplify &&', () => {
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '&&', left: true, right: true})))
        .toBe(true);
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '&&', left: true, right: false})))
        .toBe(false);
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '&&', left: false, right: true})))
        .toBe(false);
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '&&', left: false, right: false})))
        .toBe(false);
  });

  it('should simplify ||', () => {
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '||', left: true, right: true})))
        .toBe(true);
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '||', left: true, right: false})))
        .toBe(true);
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '||', left: false, right: true})))
        .toBe(true);
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '||', left: false, right: false})))
        .toBe(false);
  });

  it('should simplify &', () => {
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '&', left: 0x22, right: 0x0F})))
        .toBe(0x22 & 0x0F);
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '&', left: 0x22, right: 0xF0})))
        .toBe(0x22 & 0xF0);
  });

  it('should simplify |', () => {
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '|', left: 0x22, right: 0x0F})))
        .toBe(0x22 | 0x0F);
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '|', left: 0x22, right: 0xF0})))
        .toBe(0x22 | 0xF0);
  });

  it('should simplify ^', () => {
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '|', left: 0x22, right: 0x0F})))
        .toBe(0x22 | 0x0F);
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '|', left: 0x22, right: 0xF0})))
        .toBe(0x22 | 0xF0);
  });

  it('should simplify ==', () => {
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '==', left: 0x22, right: 0x22})))
        .toBe(0x22 == 0x22);
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '==', left: 0x22, right: 0xF0})))
        .toBe(0x22 as any == 0xF0);
  });

  it('should simplify !=', () => {
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '!=', left: 0x22, right: 0x22})))
        .toBe(0x22 != 0x22);
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '!=', left: 0x22, right: 0xF0})))
        .toBe(0x22 as any != 0xF0);
  });

  it('should simplify ===', () => {
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '===', left: 0x22, right: 0x22})))
        .toBe(0x22 === 0x22);
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '===', left: 0x22, right: 0xF0})))
        .toBe(0x22 as any === 0xF0);
  });

  it('should simplify !==', () => {
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '!==', left: 0x22, right: 0x22})))
        .toBe(0x22 !== 0x22);
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '!==', left: 0x22, right: 0xF0})))
        .toBe(0x22 as any !== 0xF0);
  });

  it('should simplify >', () => {
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '>', left: 1, right: 1})))
        .toBe(1 > 1);
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '>', left: 1, right: 0})))
        .toBe(1 > 0);
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '>', left: 0, right: 1})))
        .toBe(0 > 1);
  });

  it('should simplify >=', () => {
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '>=', left: 1, right: 1})))
        .toBe(1 >= 1);
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '>=', left: 1, right: 0})))
        .toBe(1 >= 0);
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '>=', left: 0, right: 1})))
        .toBe(0 >= 1);
  });

  it('should simplify <=', () => {
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '<=', left: 1, right: 1})))
        .toBe(1 <= 1);
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '<=', left: 1, right: 0})))
        .toBe(1 <= 0);
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '<=', left: 0, right: 1})))
        .toBe(0 <= 1);
  });

  it('should simplify <', () => {
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '<', left: 1, right: 1})))
        .toBe(1 < 1);
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '<', left: 1, right: 0})))
        .toBe(1 < 0);
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '<', left: 0, right: 1})))
        .toBe(0 < 1);
  });

  it('should simplify <<', () => {
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '<<', left: 0x55, right: 2})))
        .toBe(0x55 << 2);
  });

  it('should simplify >>', () => {
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '>>', left: 0x55, right: 2})))
        .toBe(0x55 >> 2);
  });

  it('should simplify +', () => {
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '+', left: 0x55, right: 2})))
        .toBe(0x55 + 2);
  });

  it('should simplify -', () => {
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '-', left: 0x55, right: 2})))
        .toBe(0x55 - 2);
  });

  it('should simplify *', () => {
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '*', left: 0x55, right: 2})))
        .toBe(0x55 * 2);
  });

  it('should simplify /', () => {
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '/', left: 0x55, right: 2})))
        .toBe(0x55 / 2);
  });

  it('should simplify %', () => {
    expect(simplify(noContext, ({__symbolic: 'binop', operator: '%', left: 0x55, right: 2})))
        .toBe(0x55 % 2);
  });

  it('should simplify prefix -', () => {
    expect(simplify(noContext, ({__symbolic: 'pre', operator: '-', operand: 2}))).toBe(-2);
  });

  it('should simplify prefix ~', () => {
    expect(simplify(noContext, ({__symbolic: 'pre', operator: '~', operand: 2}))).toBe(~2);
  });

  it('should simplify prefix !', () => {
    expect(simplify(noContext, ({__symbolic: 'pre', operator: '!', operand: true}))).toBe(!true);
    expect(simplify(noContext, ({__symbolic: 'pre', operator: '!', operand: false}))).toBe(!false);
  });

  it('should simplify an array index', () => {
    expect(simplify(noContext, ({__symbolic: 'index', expression: [1, 2, 3], index: 2}))).toBe(3);
  });

  it('should simplify an object index', () => {
    const expr = {__symbolic: 'select', expression: {a: 1, b: 2, c: 3}, member: 'b'};
    expect(simplify(noContext, expr)).toBe(2);
  });

  it('should simplify a file reference', () => {
    expect(simplify(
               reflector.getStaticSymbol('/src/cases', ''),
               reflector.getStaticSymbol('/src/extern.d.ts', 's')))
        .toEqual('s');
  });

  it('should simplify a non existing reference as a static symbol', () => {
    expect(simplify(
               reflector.getStaticSymbol('/src/cases', ''),
               reflector.getStaticSymbol('/src/extern.d.ts', 'nonExisting')))
        .toEqual(reflector.getStaticSymbol('/src/extern.d.ts', 'nonExisting'));
  });

  it('should simplify a function reference as a static symbol', () => {
    expect(simplify(
               reflector.getStaticSymbol('/src/cases', 'myFunction'),
               ({__symbolic: 'function', parameters: ['a'], value: []})))
        .toEqual(reflector.getStaticSymbol('/src/cases', 'myFunction'));
  });

  it('should simplify values initialized with a function call', () => {
    expect(simplify(
               reflector.getStaticSymbol('/tmp/src/function-reference.ts', ''),
               reflector.getStaticSymbol('/tmp/src/function-reference.ts', 'one')))
        .toEqual(['some-value']);
    expect(simplify(
               reflector.getStaticSymbol('/tmp/src/function-reference.ts', ''),
               reflector.getStaticSymbol('/tmp/src/function-reference.ts', 'three')))
        .toEqual(3);
  });

  it('should error on direct recursive calls', () => {
    expect(
        () => simplify(
            reflector.getStaticSymbol('/tmp/src/function-reference.ts', ''),
            reflector.getStaticSymbol('/tmp/src/function-reference.ts', 'recursion')))
        .toThrow(new Error(
            'Recursion not supported, resolving symbol recursive in /tmp/src/function-recursive.d.ts, resolving symbol recursion in /tmp/src/function-reference.ts, resolving symbol  in /tmp/src/function-reference.ts'));
  });

  it('should throw a SyntaxError without stack trace when the required resource cannot be resolved',
     () => {
       expect(
           () => simplify(
               reflector.getStaticSymbol('/tmp/src/function-reference.ts', 'AppModule'), ({
                 __symbolic: 'error',
                 message:
                     'Could not resolve ./does-not-exist.component relative to /tmp/src/function-reference.ts'
               })))
           .toThrowError(
               'Error encountered resolving symbol values statically. Could not resolve ./does-not-exist.component relative to /tmp/src/function-reference.ts, resolving symbol AppModule in /tmp/src/function-reference.ts');
     });

  it('should record data about the error in the exception', () => {
    let threw = false;
    try {
      const metadata = host.getMetadataFor('/tmp/src/invalid-metadata.ts') !;
      expect(metadata).toBeDefined();
      const moduleMetadata: any = metadata[0]['metadata'];
      expect(moduleMetadata).toBeDefined();
      const classData: any = moduleMetadata['InvalidMetadata'];
      expect(classData).toBeDefined();
      simplify(
          reflector.getStaticSymbol('/tmp/src/invalid-metadata.ts', ''), classData.decorators[0]);
    } catch (e) {
      expect(e.fileName).toBe('/tmp/src/invalid-metadata.ts');
      threw = true;
    }
    expect(threw).toBe(true);
  });

  it('should error on indirect recursive calls', () => {
    expect(
        () => simplify(
            reflector.getStaticSymbol('/tmp/src/function-reference.ts', ''),
            reflector.getStaticSymbol('/tmp/src/function-reference.ts', 'indirectRecursion')))
        .toThrow(new Error(
            'Recursion not supported, resolving symbol indirectRecursion2 in /tmp/src/function-recursive.d.ts, resolving symbol indirectRecursion1 in /tmp/src/function-recursive.d.ts, resolving symbol indirectRecursion in /tmp/src/function-reference.ts, resolving symbol  in /tmp/src/function-reference.ts'));
  });

  it('should simplify a spread expression', () => {
    expect(simplify(
               reflector.getStaticSymbol('/tmp/src/spread.ts', ''),
               reflector.getStaticSymbol('/tmp/src/spread.ts', 'spread')))
        .toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('should be able to get metadata for a class containing a custom decorator', () => {
    const props = reflector.propMetadata(
        reflector.getStaticSymbol('/tmp/src/custom-decorator-reference.ts', 'Foo'));
    expect(props).toEqual({foo: []});
  });

  it('should read ctor parameters with forwardRef', () => {
    const src = '/tmp/src/forward-ref.ts';
    const dep = reflector.getStaticSymbol(src, 'Dep');
    const props = reflector.parameters(reflector.getStaticSymbol(src, 'Forward'));
    expect(props).toEqual([[dep, new Inject(dep)]]);
  });

  it('should report an error for invalid function calls', () => {
    expect(
        () => reflector.annotations(
            reflector.getStaticSymbol('/tmp/src/invalid-calls.ts', 'MyComponent')))
        .toThrow(new Error(
            `Error encountered resolving symbol values statically. Calling function 'someFunction', function calls are not supported. Consider replacing the function or lambda with a reference to an exported function, resolving symbol MyComponent in /tmp/src/invalid-calls.ts, resolving symbol MyComponent in /tmp/src/invalid-calls.ts`));
  });

  it('should be able to get metadata for a class containing a static method call', () => {
    const annotations = reflector.annotations(
        reflector.getStaticSymbol('/tmp/src/static-method-call.ts', 'MyComponent'));
    expect(annotations.length).toBe(1);
    expect(annotations[0].providers).toEqual({provider: 'a', useValue: 100});
  });

  it('should be able to get metadata for a class containing a static field reference', () => {
    const annotations = reflector.annotations(
        reflector.getStaticSymbol('/tmp/src/static-field-reference.ts', 'Foo'));
    expect(annotations.length).toBe(1);
    expect(annotations[0].providers).toEqual([{provider: 'a', useValue: 'Some string'}]);
  });

  it('should be able to get the metadata for a class calling a method with a conditional expression',
     () => {
       const annotations = reflector.annotations(
           reflector.getStaticSymbol('/tmp/src/static-method-call.ts', 'MyCondComponent'));
       expect(annotations.length).toBe(1);
       expect(annotations[0].providers).toEqual([
         [{provider: 'a', useValue: '1'}], [{provider: 'a', useValue: '2'}]
       ]);
     });

  it('should be able to get metadata for a class with nested method calls', () => {
    const annotations = reflector.annotations(
        reflector.getStaticSymbol('/tmp/src/static-method-call.ts', 'MyFactoryComponent'));
    expect(annotations.length).toBe(1);
    expect(annotations[0].providers).toEqual({
      provide: 'c',
      useFactory:
          reflector.getStaticSymbol('/tmp/src/static-method.ts', 'AnotherModule', ['someFactory'])
    });
  });

  it('should be able to get the metadata for a class calling a method with default parameters',
     () => {
       const annotations = reflector.annotations(
           reflector.getStaticSymbol('/tmp/src/static-method-call.ts', 'MyDefaultsComponent'));
       expect(annotations.length).toBe(1);
       expect(annotations[0].providers).toEqual([['a', true, false]]);
     });

  it('should be able to get metadata with a reference to a static method', () => {
    const annotations = reflector.annotations(
        reflector.getStaticSymbol('/tmp/src/static-method-ref.ts', 'MethodReference'));
    expect(annotations.length).toBe(1);
    expect(annotations[0].providers[0].useValue.members[0]).toEqual('staticMethod');
  });

  // #13605
  it('should not throw on unknown decorators', () => {
    const data = Object.create(DEFAULT_TEST_DATA);
    const file = '/tmp/src/app.component.ts';
    data[file] = `
      import { Component } from '@angular/core';

      export const enum TypeEnum {
        type
      }

      export function MyValidationDecorator(p1: any, p2: any): any {
        return null;
      }

      export function ValidationFunction(a1: any): any {
        return null;
      }

      @Component({
        selector: 'my-app',
        template: "<h1>Hello {{name}}</h1>",
      })
      export class AppComponent  {
        name = 'Angular';

        @MyValidationDecorator( TypeEnum.type, ValidationFunction({option: 'value'}))
        myClassProp: number;
    }`;
    init(data);
    const appComponent = reflector.getStaticSymbol(file, 'AppComponent');
    expect(() => reflector.propMetadata(appComponent)).not.toThrow();
  });

  it('should not throw with an invalid extends', () => {
    const data = Object.create(DEFAULT_TEST_DATA);
    const file = '/tmp/src/invalid-component.ts';
    data[file] = `
        import {Component} from '@angular/core';

        function InvalidParent() {
          return InvalidParent;
        }

        @Component({
          selector: 'tmp',
          template: '',
        })
        export class BadComponent extends InvalidParent() {

        }
      `;
    init(data);
    const badComponent = reflector.getStaticSymbol(file, 'BadComponent');
    expect(reflector.propMetadata(badComponent)).toEqual({});
    expect(reflector.parameters(badComponent)).toEqual([]);
    expect(reflector.hasLifecycleHook(badComponent, 'onDestroy')).toEqual(false);
  });

  it('should produce a annotation even if it contains errors', () => {
    const data = Object.create(DEFAULT_TEST_DATA);
    const file = '/tmp/src/invalid-component.ts';
    data[file] = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'tmp',
          template: () => {},
          providers: [1, 2, (() => {}), 3, !(() => {}), 4, 5, (() => {}) + (() => {}), 6, 7]
        })
        export class BadComponent {

        }
      `;
    init(data, [], () => {}, {verboseInvalidExpression: true});

    const badComponent = reflector.getStaticSymbol(file, 'BadComponent');
    const annotations = reflector.annotations(badComponent);
    const annotation = annotations[0];
    expect(annotation.selector).toEqual('tmp');
    expect(annotation.template).toBeUndefined();
    expect(annotation.providers).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('should ignore unresolved calls', () => {
    const data = Object.create(DEFAULT_TEST_DATA);
    const file = '/tmp/src/invalid-component.ts';
    data[file] = `
        import {Component} from '@angular/core';
        import {unknown} from 'unresolved';

        @Component({
          selector: 'tmp',
          template: () => {},
          providers: [triggers()]
        })
        export class BadComponent {

        }
      `;
    init(data, [], () => {}, {verboseInvalidExpression: true});

    const badComponent = reflector.getStaticSymbol(file, 'BadComponent');
    const annotations = reflector.annotations(badComponent);
    const annotation = annotations[0];
    expect(annotation.providers).toEqual([]);
  });

  describe('inheritance', () => {
    class ClassDecorator {
      constructor(public value: any) {}
    }

    class ParamDecorator {
      constructor(public value: any) {}
    }

    class PropDecorator {
      constructor(public value: any) {}
    }

    function initWithDecorator(testData: {[key: string]: any}) {
      testData['/tmp/src/decorator.ts'] = `
            export function ClassDecorator(): any {}
            export function ParamDecorator(): any {}
            export function PropDecorator(): any {}
      `;
      init(testData, [
        {filePath: '/tmp/src/decorator.ts', name: 'ClassDecorator', ctor: ClassDecorator},
        {filePath: '/tmp/src/decorator.ts', name: 'ParamDecorator', ctor: ParamDecorator},
        {filePath: '/tmp/src/decorator.ts', name: 'PropDecorator', ctor: PropDecorator}
      ]);
    }

    it('should inherit annotations', () => {
      initWithDecorator({
        '/tmp/src/main.ts': `
            import {ClassDecorator} from './decorator';

            @ClassDecorator('parent')
            export class Parent {}

            @ClassDecorator('child')
            export class Child extends Parent {}

            export class ChildNoDecorators extends Parent {}

            export class ChildInvalidParent extends a.InvalidParent {}
          `
      });

      // Check that metadata for Parent was not changed!
      expect(reflector.annotations(reflector.getStaticSymbol('/tmp/src/main.ts', 'Parent')))
          .toEqual([new ClassDecorator('parent')]);

      expect(reflector.annotations(reflector.getStaticSymbol('/tmp/src/main.ts', 'Child')))
          .toEqual([new ClassDecorator('parent'), new ClassDecorator('child')]);

      expect(
          reflector.annotations(reflector.getStaticSymbol('/tmp/src/main.ts', 'ChildNoDecorators')))
          .toEqual([new ClassDecorator('parent')]);

      expect(reflector.annotations(
                 reflector.getStaticSymbol('/tmp/src/main.ts', 'ChildInvalidParent')))
          .toEqual([]);
    });

    it('should inherit parameters', () => {
      initWithDecorator({
        '/tmp/src/main.ts': `
            import {ParamDecorator} from './decorator';

            export class A {}
            export class B {}
            export class C {}

            export class Parent {
              constructor(@ParamDecorator('a') a: A, @ParamDecorator('b') b: B) {}
            }

            export class Child extends Parent {}

            export class ChildWithCtor extends Parent {
              constructor(@ParamDecorator('c') c: C) {}
            }

            export class ChildInvalidParent extends a.InvalidParent {}
          `
      });

      // Check that metadata for Parent was not changed!
      expect(reflector.parameters(reflector.getStaticSymbol('/tmp/src/main.ts', 'Parent')))
          .toEqual([
            [reflector.getStaticSymbol('/tmp/src/main.ts', 'A'), new ParamDecorator('a')],
            [reflector.getStaticSymbol('/tmp/src/main.ts', 'B'), new ParamDecorator('b')]
          ]);

      expect(reflector.parameters(reflector.getStaticSymbol('/tmp/src/main.ts', 'Child'))).toEqual([
        [reflector.getStaticSymbol('/tmp/src/main.ts', 'A'), new ParamDecorator('a')],
        [reflector.getStaticSymbol('/tmp/src/main.ts', 'B'), new ParamDecorator('b')]
      ]);

      expect(reflector.parameters(reflector.getStaticSymbol('/tmp/src/main.ts', 'ChildWithCtor')))
          .toEqual([[reflector.getStaticSymbol('/tmp/src/main.ts', 'C'), new ParamDecorator('c')]]);

      expect(
          reflector.parameters(reflector.getStaticSymbol('/tmp/src/main.ts', 'ChildInvalidParent')))
          .toEqual([]);
    });

    it('should inherit property metadata', () => {
      initWithDecorator({
        '/tmp/src/main.ts': `
            import {PropDecorator} from './decorator';

            export class A {}
            export class B {}
            export class C {}

            export class Parent {
              @PropDecorator('a')
              a: A;
              @PropDecorator('b1')
              b: B;
            }

            export class Child extends Parent {
              @PropDecorator('b2')
              b: B;
              @PropDecorator('c')
              c: C;
            }

            export class ChildInvalidParent extends a.InvalidParent {}
          `
      });

      // Check that metadata for Parent was not changed!
      expect(reflector.propMetadata(reflector.getStaticSymbol('/tmp/src/main.ts', 'Parent')))
          .toEqual({
            'a': [new PropDecorator('a')],
            'b': [new PropDecorator('b1')],
          });

      expect(reflector.propMetadata(reflector.getStaticSymbol('/tmp/src/main.ts', 'Child')))
          .toEqual({
            'a': [new PropDecorator('a')],
            'b': [new PropDecorator('b1'), new PropDecorator('b2')],
            'c': [new PropDecorator('c')]
          });

      expect(reflector.propMetadata(
                 reflector.getStaticSymbol('/tmp/src/main.ts', 'ChildInvalidParent')))
          .toEqual({});
    });

    it('should inherit lifecycle hooks', () => {
      initWithDecorator({
        '/tmp/src/main.ts': `
            export class Parent {
              hook1() {}
              hook2() {}
            }

            export class Child extends Parent {
              hook2() {}
              hook3() {}
            }

            export class ChildInvalidParent extends a.InvalidParent {}
          `
      });

      function hooks(symbol: StaticSymbol, names: string[]): boolean[] {
        return names.map(name => reflector.hasLifecycleHook(symbol, name));
      }

      // Check that metadata for Parent was not changed!
      expect(hooks(reflector.getStaticSymbol('/tmp/src/main.ts', 'Parent'), [
        'hook1', 'hook2', 'hook3'
      ])).toEqual([true, true, false]);

      expect(hooks(reflector.getStaticSymbol('/tmp/src/main.ts', 'Child'), [
        'hook1', 'hook2', 'hook3'
      ])).toEqual([true, true, true]);

      expect(hooks(reflector.getStaticSymbol('/tmp/src/main.ts', 'ChildInvalidParent'), [
        'hook1', 'hook2', 'hook3'
      ])).toEqual([false, false, false]);
    });

    it('should allow inheritance from expressions', () => {
      initWithDecorator({
        '/tmp/src/main.ts': `
            export function metaClass() { return null; };
            export class Child extends metaClass() {}
          `
      });

      expect(reflector.annotations(reflector.getStaticSymbol('/tmp/src/main.ts', 'Child')))
          .toEqual([]);
    });

    it('should allow inheritance from functions', () => {
      initWithDecorator({
        '/tmp/src/main.ts': `
            export let ctor: {new(): T} = function() { return null; }
            export class Child extends ctor {}
          `
      });

      expect(reflector.annotations(reflector.getStaticSymbol('/tmp/src/main.ts', 'Child')))
          .toEqual([]);
    });

    it('should support constructor parameters with @Inject and an interface type', () => {
      const data = Object.create(DEFAULT_TEST_DATA);
      const file = '/tmp/src/inject_interface.ts';
      data[file] = `
        import {Injectable, Inject} from '@angular/core';
        import {F} from './f';

        export interface InjectedInterface {

        }

        export class Token {}

        @Injectable()
        export class SomeClass {
          constructor (@Inject(Token) injected: InjectedInterface, t: Token, @Inject(Token) f: F) {}
        }
      `;

      init(data);

      expect(reflector.parameters(reflector.getStaticSymbol(file, 'SomeClass'))[0].length)
          .toEqual(1);
    });
  });

});

const DEFAULT_TEST_DATA: {[key: string]: any} = {
      '/tmp/@angular/common/src/forms-deprecated/directives.d.ts': [{
        '__symbolic': 'module',
        'version': 3,
        'metadata': {
          'FORM_DIRECTIVES': [
            {
              '__symbolic': 'reference',
              'name': 'NgFor',
              'module': '@angular/common/src/directives/ng_for'
            }
          ]
        }
      }],
      '/tmp/@angular/common/src/directives/ng_for.d.ts': {
        '__symbolic': 'module',
        'version': 3,
        'metadata': {
          'NgFor': {
            '__symbolic': 'class',
            'decorators': [
              {
                '__symbolic': 'call',
                'expression': {
                  '__symbolic': 'reference',
                  'name': 'Directive',
                  'module': '@angular/core'
                },
                'arguments': [
                  {
                    'selector': '[ngFor][ngForOf]',
                    'inputs': ['ngForTrackBy', 'ngForOf', 'ngForTemplate']
                  }
                ]
              }
            ],
            'members': {
              '__ctor__': [
                {
                  '__symbolic': 'constructor',
                  'parameters': [
                    {
                      '__symbolic': 'reference',
                      'module': '@angular/core',
                      'name': 'ViewContainerRef'
                    },
                    {
                      '__symbolic': 'reference',
                      'module': '@angular/core',
                      'name': 'TemplateRef'
                    },
                    {
                      '__symbolic': 'reference',
                      'module': '@angular/core',
                      'name': 'IterableDiffers'
                    },
                    {
                      '__symbolic': 'reference',
                      'module': '@angular/core',
                      'name': 'ChangeDetectorRef'
                    }
                  ]
                }
              ]
            }
          }
        }
      },
      '/tmp/@angular/core/src/linker/view_container_ref.d.ts':
          {version: 3, 'metadata': {'ViewContainerRef': {'__symbolic': 'class'}}},
      '/tmp/@angular/core/src/linker/template_ref.d.ts':
          {version: 3, 'module': './template_ref', 'metadata': {'TemplateRef': {'__symbolic': 'class'}}},
      '/tmp/@angular/core/src/change_detection/differs/iterable_differs.d.ts':
          {version: 3, 'metadata': {'IterableDiffers': {'__symbolic': 'class'}}},
      '/tmp/@angular/core/src/change_detection/change_detector_ref.d.ts':
          {version: 3, 'metadata': {'ChangeDetectorRef': {'__symbolic': 'class'}}},
      '/tmp/src/app/hero-detail.component.d.ts': {
        '__symbolic': 'module',
        'version': 3,
        'metadata': {
          'HeroDetailComponent': {
            '__symbolic': 'class',
            'decorators': [
              {
                '__symbolic': 'call',
                'expression': {
                  '__symbolic': 'reference',
                  'name': 'Component',
                  'module': '@angular/core'
                },
                'arguments': [
                  {
                    'selector': 'my-hero-detail',
                    'template':
                        '\n  <div *ngIf="hero">\n    <h2>{{hero.name}} details!</h2>\n    <div><label>id: </label>{{hero.id}}</div>\n    <div>\n      <label>name: </label>\n      <input [(ngModel)]="hero.name" placeholder="name"/>\n    </div>\n  </div>\n',
                    'animations': [{
                      '__symbolic': 'call',
                      'expression': {
                        '__symbolic': 'reference',
                        'name': 'trigger',
                        'module': '@angular/core'
                      },
                      'arguments': [
                        'myAnimation',
                        [{ '__symbolic': 'call',
                           'expression': {
                             '__symbolic': 'reference',
                             'name': 'state',
                             'module': '@angular/core'
                           },
                           'arguments': [
                             'state1',
                              { '__symbolic': 'call',
                                'expression': {
                                  '__symbolic': 'reference',
                                  'name': 'style',
                                  'module': '@angular/core'
                                },
                                'arguments': [
                                  { 'background':'white' }
                                ]
                              }
                            ]
                          }, {
                            '__symbolic': 'call',
                            'expression': {
                              '__symbolic':'reference',
                              'name':'transition',
                              'module': '@angular/core'
                            },
                            'arguments': [
                              '* => *',
                              {
                                '__symbolic':'call',
                                'expression':{
                                  '__symbolic':'reference',
                                  'name':'sequence',
                                  'module': '@angular/core'
                                },
                                'arguments':[[{ '__symbolic': 'call',
                                  'expression': {
                                    '__symbolic':'reference',
                                    'name':'group',
                                    'module': '@angular/core'
                                  },
                                  'arguments':[[{
                                    '__symbolic': 'call',
                                    'expression': {
                                      '__symbolic':'reference',
                                      'name':'animate',
                                      'module': '@angular/core'
                                    },
                                    'arguments':[
                                      '1s 0.5s',
                                      { '__symbolic': 'call',
                                        'expression': {
                                          '__symbolic':'reference',
                                          'name':'keyframes',
                                          'module': '@angular/core'
                                        },
                                        'arguments':[[{ '__symbolic': 'call',
                                          'expression': {
                                            '__symbolic':'reference',
                                            'name':'style',
                                            'module': '@angular/core'
                                          },
                                          'arguments':[ { 'background': 'blue'} ]
                                        }, {
                                          '__symbolic': 'call',
                                          'expression': {
                                            '__symbolic':'reference',
                                            'name':'style',
                                            'module': '@angular/core'
                                          },
                                          'arguments':[ { 'background': 'red'} ]
                                        }]]
                                      }
                                    ]
                                  }]]
                                }]]
                              }
                            ]
                          }
                        ]
                    ]
                  }]
                }]
              }],
            'members': {
              'hero': [
                {
                  '__symbolic': 'property',
                  'decorators': [
                    {
                      '__symbolic': 'call',
                      'expression': {
                        '__symbolic': 'reference',
                        'name': 'Input',
                        'module': '@angular/core'
                      }
                    }
                  ]
                }
              ],
              'onMouseOver': [
                    {
                        '__symbolic': 'method',
                        'decorators': [
                            {
                                '__symbolic': 'call',
                                'expression': {
                                    '__symbolic': 'reference',
                                    'module': '@angular/core',
                                    'name': 'HostListener'
                                },
                                'arguments': [
                                    'mouseover',
                                    [
                                        '$event'
                                    ]
                                ]
                            }
                        ]
                    }
                ]
            }
          }
        }
      },
      '/src/extern.d.ts': {'__symbolic': 'module', 'version': 3, metadata: {s: 's'}},
      '/tmp/src/error-reporting.d.ts': {
        __symbolic: 'module',
        version: 3,
        metadata: {
          SomeClass: {
            __symbolic: 'class',
            decorators: [
              {
                __symbolic: 'call',
                expression: {
                  __symbolic: 'reference',
                  name: 'Component',
                  module: '@angular/core'
                },
                arguments: [
                  {
                    entryComponents: [
                      {
                        __symbolic: 'reference',
                        module: 'src/error-references',
                        name: 'Link1',
                      }
                    ]
                  }
                ]
              }
            ],
          }
        }
      },
      '/tmp/src/error-references.d.ts': {
        __symbolic: 'module',
        version: 3,
        metadata: {
          Link1: {
            __symbolic: 'reference',
            module: 'src/error-references',
            name: 'Link2'
          },
          Link2: {
            __symbolic: 'reference',
            module: 'src/error-references',
            name: 'ErrorSym'
          },
          ErrorSym: {
            __symbolic: 'error',
            message: 'A reasonable error message',
            line: 12,
            character: 33
          }
        }
      },
      '/tmp/src/function-declaration.d.ts': {
        __symbolic: 'module',
        version: 3,
        metadata: {
          one: {
            __symbolic: 'function',
            parameters: ['a'],
            value: [
              {__symbolic: 'reference', name: 'a'}
            ]
          },
          add: {
            __symbolic: 'function',
            parameters: ['a','b'],
            value: {
              __symbolic: 'binop',
              operator: '+',
              left: {__symbolic: 'reference', name: 'a'},
              right: {
                __symbolic: 'binop',
                operator: '+',
                left: {__symbolic: 'reference', name: 'b'},
                right: {__symbolic: 'reference', name: 'oneLiteral'}
              }
            }
          },
          oneLiteral: 1
        }
      },
      '/tmp/src/function-reference.ts': {
        __symbolic: 'module',
        version: 3,
        metadata: {
          one: {
            __symbolic: 'call',
            expression: {
              __symbolic: 'reference',
              module: './function-declaration',
              name: 'one'
            },
            arguments: ['some-value']
          },
          three: {
            __symbolic: 'call',
            expression: {
              __symbolic: 'reference',
              module: './function-declaration',
              name: 'add'
            },
            arguments: [1, 1]
          },
          recursion: {
            __symbolic: 'call',
            expression: {
              __symbolic: 'reference',
              module: './function-recursive',
              name: 'recursive'
            },
            arguments: [1]
          },
          indirectRecursion: {
            __symbolic: 'call',
            expression: {
              __symbolic: 'reference',
              module: './function-recursive',
              name: 'indirectRecursion1'
            },
            arguments: [1]
          }
        }
      },
      '/tmp/src/function-recursive.d.ts': {
        __symbolic: 'modules',
        version: 3,
        metadata: {
          recursive: {
            __symbolic: 'function',
            parameters: ['a'],
            value: {
              __symbolic: 'call',
              expression: {
                __symbolic: 'reference',
                module: './function-recursive',
                name: 'recursive',
              },
              arguments: [
                {
                  __symbolic: 'reference',
                  name: 'a'
                }
              ]
            }
          },
          indirectRecursion1: {
            __symbolic: 'function',
            parameters: ['a'],
            value: {
              __symbolic: 'call',
              expression: {
                __symbolic: 'reference',
                module: './function-recursive',
                name: 'indirectRecursion2',
              },
              arguments: [
                {
                  __symbolic: 'reference',
                  name: 'a'
                }
              ]
            }
          },
          indirectRecursion2: {
            __symbolic: 'function',
            parameters: ['a'],
            value: {
              __symbolic: 'call',
              expression: {
                __symbolic: 'reference',
                module: './function-recursive',
                name: 'indirectRecursion1',
              },
              arguments: [
                {
                  __symbolic: 'reference',
                  name: 'a'
                }
              ]
            }
          }
        },
      },
      '/tmp/src/spread.ts': {
        __symbolic: 'module',
        version: 3,
        metadata: {
          spread: [0, {__symbolic: 'spread', expression: [1, 2, 3, 4]}, 5]
        }
      },
      '/tmp/src/custom-decorator.ts': `
        export function CustomDecorator(): any {
          return () => {};
        }
      `,
      '/tmp/src/custom-decorator-reference.ts': `
        import {CustomDecorator} from './custom-decorator';

        @CustomDecorator()
        export class Foo {
          @CustomDecorator() get foo(): string { return ''; }
        }
      `,
      '/tmp/src/invalid-calll-definitions.ts': `
        export function someFunction(a: any) {
          if (Array.isArray(a)) {
            return a;
          }
          return undefined;
        }
      `,
      '/tmp/src/invalid-calls.ts': `
        import {someFunction} from './nvalid-calll-definitions.ts';
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          selector: 'my-component',
          entryComponents: [someFunction([NgIf])]
        })
        export class MyComponent {}

        @someFunction()
        @Component({
          selector: 'my-component',
          entryComponents: [NgIf]
        })
        export class MyOtherComponent { }
      `,
      '/tmp/src/static-method.ts': `
        import {Component} from '@angular/core/src/metadata';

        @Component({
          selector: 'stub'
        })
        export class MyModule {
          static with(data: any) {
            return { provider: 'a', useValue: data }
          }
          static condMethod(cond: boolean) {
            return [{ provider: 'a', useValue: cond ? '1' : '2'}];
          }
          static defaultsMethod(a, b = true, c = false) {
            return [a, b, c];
          }
          static withFactory() {
            return { provide: 'c', useFactory: AnotherModule.someFactory };
          }
        }

        export class AnotherModule {
          static someFactory() {
            return 'e';
          }
        }
      `,
      '/tmp/src/static-method-call.ts': `
        import {Component} from '@angular/core';
        import {MyModule} from './static-method';

        @Component({
          providers: MyModule.with(100)
        })
        export class MyComponent { }

        @Component({
          providers: [MyModule.condMethod(true), MyModule.condMethod(false)]
        })
        export class MyCondComponent { }

        @Component({
          providers: [MyModule.defaultsMethod('a')]
        })
        export class MyDefaultsComponent { }

        @Component({
          providers: MyModule.withFactory()
        })
        export class MyFactoryComponent { }
      `,
      '/tmp/src/static-field.ts': `
        import {Injectable} from '@angular/core';

        @Injectable()
        export class MyModule {
          static VALUE = 'Some string';
        }
      `,
      '/tmp/src/static-field-reference.ts': `
        import {Component} from '@angular/core';
        import {MyModule} from './static-field';

        @Component({
          providers: [ { provider: 'a', useValue: MyModule.VALUE } ]
        })
        export class Foo { }
      `,
      '/tmp/src/static-method-def.ts': `
        export class ClassWithStatics {
          static staticMethod() {}
        }
      `,
      '/tmp/src/static-method-ref.ts': `
        import {Component} from '@angular/core';
        import {ClassWithStatics} from './static-method-def';

        @Component({
          providers: [ { provider: 'a', useValue: ClassWithStatics.staticMethod}]
        })
        export class MethodReference {

        }
      `,
      '/tmp/src/invalid-metadata.ts': `
        import {Component} from '@angular/core';

        @Component({
          providers: [ { provider: 'a', useValue: (() => 1)() }]
        })
        export class InvalidMetadata {}
      `,
      '/tmp/src/forward-ref.ts': `
        import {forwardRef} from '@angular/core';
        import {Component} from '@angular/core';
        import {Inject} from '@angular/core';
        @Component({})
        export class Forward {
          constructor(@Inject(forwardRef(() => Dep)) d: Dep) {}
        }
        export class Dep {
          @Input f: Forward;
        }
      `
    };
