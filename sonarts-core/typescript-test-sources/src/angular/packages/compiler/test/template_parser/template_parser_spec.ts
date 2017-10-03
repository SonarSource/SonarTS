/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CompileQueryMetadata, CompilerConfig, ProxyClass, StaticSymbol} from '@angular/compiler';
import {CompileAnimationEntryMetadata, CompileDiDependencyMetadata, CompileDirectiveMetadata, CompileDirectiveSummary, CompilePipeMetadata, CompilePipeSummary, CompileProviderMetadata, CompileTemplateMetadata, CompileTokenMetadata, CompileTypeMetadata, tokenReference} from '@angular/compiler/src/compile_metadata';
import {DomElementSchemaRegistry} from '@angular/compiler/src/schema/dom_element_schema_registry';
import {ElementSchemaRegistry} from '@angular/compiler/src/schema/element_schema_registry';
import {AttrAst, BoundDirectivePropertyAst, BoundElementPropertyAst, BoundEventAst, BoundTextAst, DirectiveAst, ElementAst, EmbeddedTemplateAst, NgContentAst, PropertyBindingType, ProviderAstType, ReferenceAst, TemplateAst, TemplateAstVisitor, TextAst, VariableAst, templateVisitAll} from '@angular/compiler/src/template_parser/template_ast';
import {TEMPLATE_TRANSFORMS, TemplateParser, splitClasses} from '@angular/compiler/src/template_parser/template_parser';
import {TEST_COMPILER_PROVIDERS} from '@angular/compiler/testing/src/test_bindings';
import {ChangeDetectionStrategy, ComponentFactory, RendererType2, SchemaMetadata, SecurityContext, ViewEncapsulation} from '@angular/core';
import {Console} from '@angular/core/src/console';
import {TestBed, inject} from '@angular/core/testing';

import {CompileEntryComponentMetadata, CompileStylesheetMetadata} from '../../src/compile_metadata';
import {Identifiers, createIdentifierToken, identifierToken} from '../../src/identifiers';
import {DEFAULT_INTERPOLATION_CONFIG, InterpolationConfig} from '../../src/ml_parser/interpolation_config';
import {noUndefined} from '../../src/util';
import {MockSchemaRegistry} from '../../testing';
import {unparse} from '../expression_parser/unparser';

const someModuleUrl = 'package:someModule';

const MOCK_SCHEMA_REGISTRY = [{
  provide: ElementSchemaRegistry,
  useValue: new MockSchemaRegistry(
      {'invalidProp': false}, {'mappedAttr': 'mappedProp'}, {'unknown': false, 'un-known': false},
      ['onEvent'], ['onEvent']),
}];

function createTypeMeta({reference, diDeps}: {reference: any, diDeps?: any[]}):
    CompileTypeMetadata {
  return {reference: reference, diDeps: diDeps || [], lifecycleHooks: []};
}

function compileDirectiveMetadataCreate(
    {isHost, type, isComponent, selector, exportAs, changeDetection, inputs, outputs, host,
     providers, viewProviders, queries, viewQueries, entryComponents, template, componentViewType,
     rendererType, componentFactory}: {
      isHost?: boolean,
      type?: CompileTypeMetadata,
      isComponent?: boolean,
      selector?: string | null,
      exportAs?: string | null,
      changeDetection?: ChangeDetectionStrategy | null,
      inputs?: string[],
      outputs?: string[],
      host?: {[key: string]: string},
      providers?: CompileProviderMetadata[] | null,
      viewProviders?: CompileProviderMetadata[] | null,
      queries?: CompileQueryMetadata[] | null,
      viewQueries?: CompileQueryMetadata[],
      entryComponents?: CompileEntryComponentMetadata[],
      template?: CompileTemplateMetadata,
      componentViewType?: StaticSymbol | ProxyClass | null,
      rendererType?: StaticSymbol | RendererType2 | null,
      componentFactory?: StaticSymbol | ComponentFactory<any>
    }) {
  return CompileDirectiveMetadata.create({
    isHost: !!isHost,
    type: noUndefined(type) !,
    isComponent: !!isComponent,
    selector: noUndefined(selector),
    exportAs: noUndefined(exportAs),
    changeDetection: null,
    inputs: inputs || [],
    outputs: outputs || [],
    host: host || {},
    providers: providers || [],
    viewProviders: viewProviders || [],
    queries: queries || [],
    viewQueries: viewQueries || [],
    entryComponents: entryComponents || [],
    template: noUndefined(template) !,
    componentViewType: noUndefined(componentViewType),
    rendererType: noUndefined(rendererType),
    componentFactory: noUndefined(componentFactory),
  });
}

function compileTemplateMetadata({encapsulation, template, templateUrl, styles, styleUrls,
                                  externalStylesheets, animations, ngContentSelectors,
                                  interpolation, isInline}: {
  encapsulation?: ViewEncapsulation | null,
  template?: string | null,
  templateUrl?: string | null,
  styles?: string[],
  styleUrls?: string[],
  externalStylesheets?: CompileStylesheetMetadata[],
  ngContentSelectors?: string[],
  animations?: any[],
  interpolation?: [string, string] | null,
  isInline?: boolean
}): CompileTemplateMetadata {
  return new CompileTemplateMetadata({
    encapsulation: noUndefined(encapsulation),
    template: noUndefined(template),
    templateUrl: noUndefined(templateUrl),
    styles: styles || [],
    styleUrls: styleUrls || [],
    externalStylesheets: externalStylesheets || [],
    animations: animations || [],
    ngContentSelectors: ngContentSelectors || [],
    interpolation: noUndefined(interpolation),
    isInline: !!isInline
  });
}



export function main() {
  let ngIf: CompileDirectiveSummary;
  let parse: (
      template: string, directives: CompileDirectiveSummary[], pipes?: CompilePipeSummary[],
      schemas?: SchemaMetadata[]) => TemplateAst[];
  let console: ArrayConsole;

  function commonBeforeEach() {
    beforeEach(() => {
      console = new ArrayConsole();
      TestBed.configureCompiler({
        providers: [
          {provide: Console, useValue: console},
        ],
      });
    });

    beforeEach(inject([TemplateParser], (parser: TemplateParser) => {
      const someAnimation = new CompileAnimationEntryMetadata('someAnimation', []);
      const someTemplate = compileTemplateMetadata({animations: [someAnimation]});
      const component = compileDirectiveMetadataCreate({
        isHost: false,
        selector: 'root',
        template: someTemplate,
        type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'Root'}}),
        isComponent: true
      });
      ngIf = compileDirectiveMetadataCreate({
               selector: '[ngIf]',
               template: someTemplate,
               type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'NgIf'}}),
               inputs: ['ngIf']
             }).toSummary();

      parse =
          (template: string, directives: CompileDirectiveSummary[],
           pipes: CompilePipeSummary[] | null = null,
           schemas: SchemaMetadata[] = []): TemplateAst[] => {
            if (pipes === null) {
              pipes = [];
            }
            return parser.parse(component, template, directives, pipes, schemas, 'TestComp')
                .template;
          };
    }));
  }

  describe('TemplateAstVisitor', () => {
    function expectVisitedNode(visitor: TemplateAstVisitor, node: TemplateAst) {
      expect(node.visit(visitor, null)).toEqual(node);
    }

    it('should visit NgContentAst', () => {
      expectVisitedNode(
          new class extends
          NullVisitor{visitNgContent(ast: NgContentAst, context: any): any{return ast;}},
          new NgContentAst(0, 0, null !));
    });

    it('should visit EmbeddedTemplateAst', () => {
      expectVisitedNode(
          new class extends NullVisitor{
            visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any) { return ast; }
          },
          new EmbeddedTemplateAst([], [], [], [], [], [], false, [], [], 0, null !));
    });

    it('should visit ElementAst', () => {
      expectVisitedNode(
          new class extends
          NullVisitor{visitElement(ast: ElementAst, context: any) { return ast; }},
          new ElementAst('foo', [], [], [], [], [], [], false, [], [], 0, null !, null !));
    });

    it('should visit RefererenceAst', () => {
      expectVisitedNode(
          new class extends
          NullVisitor{visitReference(ast: ReferenceAst, context: any): any{return ast;}},
          new ReferenceAst('foo', null !, null !));
    });

    it('should visit VariableAst', () => {
      expectVisitedNode(
          new class extends
          NullVisitor{visitVariable(ast: VariableAst, context: any): any{return ast;}},
          new VariableAst('foo', 'bar', null !));
    });

    it('should visit BoundEventAst', () => {
      expectVisitedNode(
          new class extends
          NullVisitor{visitEvent(ast: BoundEventAst, context: any): any{return ast;}},
          new BoundEventAst('foo', 'bar', 'goo', null !, null !));
    });

    it('should visit BoundElementPropertyAst', () => {
      expectVisitedNode(
          new class extends NullVisitor{
            visitElementProperty(ast: BoundElementPropertyAst, context: any): any{return ast;}
          },
          new BoundElementPropertyAst('foo', null !, null !, null !, 'bar', null !));
    });

    it('should visit AttrAst', () => {
      expectVisitedNode(
          new class extends NullVisitor{visitAttr(ast: AttrAst, context: any): any{return ast;}},
          new AttrAst('foo', 'bar', null !));
    });

    it('should visit BoundTextAst', () => {
      expectVisitedNode(
          new class extends
          NullVisitor{visitBoundText(ast: BoundTextAst, context: any): any{return ast;}},
          new BoundTextAst(null !, 0, null !));
    });

    it('should visit TextAst', () => {
      expectVisitedNode(
          new class extends NullVisitor{visitText(ast: TextAst, context: any): any{return ast;}},
          new TextAst('foo', 0, null !));
    });

    it('should visit DirectiveAst', () => {
      expectVisitedNode(
          new class extends
          NullVisitor{visitDirective(ast: DirectiveAst, context: any): any{return ast;}},
          new DirectiveAst(null !, [], [], [], 0, null !));
    });

    it('should visit DirectiveAst', () => {
      expectVisitedNode(
          new class extends NullVisitor{
            visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any{return ast;}
          },
          new BoundDirectivePropertyAst('foo', 'bar', null !, null !));
    });

    it('should skip the typed call of a visitor if visit() returns a truthy value', () => {
      const visitor = new class extends ThrowingVisitor {
        visit(ast: TemplateAst, context: any): any { return true; }
      };
      const nodes: TemplateAst[] = [
        new NgContentAst(0, 0, null !),
        new EmbeddedTemplateAst([], [], [], [], [], [], false, [], [], 0, null !),
        new ElementAst('foo', [], [], [], [], [], [], false, [], [], 0, null !, null !),
        new ReferenceAst('foo', null !, null !), new VariableAst('foo', 'bar', null !),
        new BoundEventAst('foo', 'bar', 'goo', null !, null !),
        new BoundElementPropertyAst('foo', null !, null !, null !, 'bar', null !),
        new AttrAst('foo', 'bar', null !), new BoundTextAst(null !, 0, null !),
        new TextAst('foo', 0, null !), new DirectiveAst(null !, [], [], [], 0, null !),
        new BoundDirectivePropertyAst('foo', 'bar', null !, null !)
      ];
      const result = templateVisitAll(visitor, nodes, null);
      expect(result).toEqual(new Array(nodes.length).fill(true));
    });
  });

  describe('TemplateParser template transform', () => {
    beforeEach(() => { TestBed.configureCompiler({providers: TEST_COMPILER_PROVIDERS}); });

    beforeEach(() => {
      TestBed.configureCompiler({
        providers:
            [{provide: TEMPLATE_TRANSFORMS, useValue: new FooAstTransformer(), multi: true}]
      });
    });

    describe('single', () => {
      commonBeforeEach();
      it('should transform TemplateAST', () => {
        expect(humanizeTplAst(parse('<div>', []))).toEqual([[ElementAst, 'foo']]);
      });
    });

    describe('multiple', () => {
      beforeEach(() => {
        TestBed.configureCompiler({
          providers:
              [{provide: TEMPLATE_TRANSFORMS, useValue: new BarAstTransformer(), multi: true}]
        });
      });

      commonBeforeEach();
      it('should compose transformers', () => {
        expect(humanizeTplAst(parse('<div>', []))).toEqual([[ElementAst, 'bar']]);
      });
    });
  });

  describe('TemplateParser Security', () => {
    // Semi-integration test to make sure TemplateParser properly sets the security context.
    // Uses the actual DomElementSchemaRegistry.
    beforeEach(() => {
      TestBed.configureCompiler({
        providers: [
          TEST_COMPILER_PROVIDERS,
          {provide: ElementSchemaRegistry, useClass: DomElementSchemaRegistry}
        ]
      });
    });

    commonBeforeEach();

    describe('security context', () => {
      function secContext(tpl: string): SecurityContext {
        const ast = parse(tpl, []);
        const propBinding = (<ElementAst>ast[0]).inputs[0];
        return propBinding.securityContext;
      }

      it('should set for properties', () => {
        expect(secContext('<div [title]="v">')).toBe(SecurityContext.NONE);
        expect(secContext('<div [innerHTML]="v">')).toBe(SecurityContext.HTML);
      });
      it('should set for property value bindings',
         () => { expect(secContext('<div innerHTML="{{v}}">')).toBe(SecurityContext.HTML); });
      it('should set for attributes', () => {
        expect(secContext('<a [attr.href]="v">')).toBe(SecurityContext.URL);
        // NB: attributes below need to change case.
        expect(secContext('<a [attr.innerHtml]="v">')).toBe(SecurityContext.HTML);
        expect(secContext('<a [attr.formaction]="v">')).toBe(SecurityContext.URL);
      });
      it('should set for style', () => {
        expect(secContext('<a [style.backgroundColor]="v">')).toBe(SecurityContext.STYLE);
      });
    });
  });

  describe('TemplateParser', () => {
    beforeEach(() => {
      TestBed.configureCompiler({providers: [TEST_COMPILER_PROVIDERS, MOCK_SCHEMA_REGISTRY]});
    });

    commonBeforeEach();

    describe('parse', () => {
      describe('nodes without bindings', () => {

        it('should parse text nodes', () => {
          expect(humanizeTplAst(parse('a', []))).toEqual([[TextAst, 'a']]);
        });

        it('should parse elements with attributes', () => {
          expect(humanizeTplAst(parse('<div a=b>', [
          ]))).toEqual([[ElementAst, 'div'], [AttrAst, 'a', 'b']]);
        });
      });

      it('should parse ngContent', () => {
        const parsed = parse('<ng-content select="a"></ng-content>', []);
        expect(humanizeTplAst(parsed)).toEqual([[NgContentAst]]);
      });

      it('should parse ngContent when it contains WS only', () => {
        const parsed = parse('<ng-content select="a">    \n   </ng-content>', []);
        expect(humanizeTplAst(parsed)).toEqual([[NgContentAst]]);
      });

      it('should parse ngContent regardless the namespace', () => {
        const parsed = parse('<svg><ng-content></ng-content></svg>', []);
        expect(humanizeTplAst(parsed)).toEqual([
          [ElementAst, ':svg:svg'],
          [NgContentAst],
        ]);
      });

      it('should parse bound text nodes', () => {
        expect(humanizeTplAst(parse('{{a}}', []))).toEqual([[BoundTextAst, '{{ a }}']]);
      });

      it('should parse with custom interpolation config',
         inject([TemplateParser], (parser: TemplateParser) => {
           const component = CompileDirectiveMetadata.create({
             selector: 'test',
             type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'Test'}}),
             isComponent: true,
             template: new CompileTemplateMetadata({
               interpolation: ['{%', '%}'],
               isInline: false,
               animations: [],
               template: null,
               templateUrl: null,
               ngContentSelectors: [],
               externalStylesheets: [],
               styleUrls: [],
               styles: [],
               encapsulation: null
             }),
             isHost: false,
             exportAs: null,
             changeDetection: null,
             inputs: [],
             outputs: [],
             host: {},
             providers: [],
             viewProviders: [],
             queries: [],
             viewQueries: [],
             entryComponents: [],
             componentViewType: null,
             rendererType: null,
             componentFactory: null

           });
           expect(humanizeTplAst(
                      parser.parse(component, '{%a%}', [], [], [], 'TestComp').template,
                      {start: '{%', end: '%}'}))
               .toEqual([[BoundTextAst, '{% a %}']]);
         }));

      describe('bound properties', () => {

        it('should parse mixed case bound properties', () => {
          expect(humanizeTplAst(parse('<div [someProp]="v">', []))).toEqual([
            [ElementAst, 'div'],
            [BoundElementPropertyAst, PropertyBindingType.Property, 'someProp', 'v', null]
          ]);
        });

        it('should parse dash case bound properties', () => {
          expect(humanizeTplAst(parse('<div [some-prop]="v">', []))).toEqual([
            [ElementAst, 'div'],
            [BoundElementPropertyAst, PropertyBindingType.Property, 'some-prop', 'v', null]
          ]);
        });

        it('should parse dotted name bound properties', () => {
          expect(humanizeTplAst(parse('<div [dot.name]="v">', []))).toEqual([
            [ElementAst, 'div'],
            [BoundElementPropertyAst, PropertyBindingType.Property, 'dot.name', 'v', null]
          ]);
        });

        it('should normalize property names via the element schema', () => {
          expect(humanizeTplAst(parse('<div [mappedAttr]="v">', []))).toEqual([
            [ElementAst, 'div'],
            [BoundElementPropertyAst, PropertyBindingType.Property, 'mappedProp', 'v', null]
          ]);
        });

        it('should parse mixed case bound attributes', () => {
          expect(humanizeTplAst(parse('<div [attr.someAttr]="v">', []))).toEqual([
            [ElementAst, 'div'],
            [BoundElementPropertyAst, PropertyBindingType.Attribute, 'someAttr', 'v', null]
          ]);
        });

        it('should parse and dash case bound classes', () => {
          expect(humanizeTplAst(parse('<div [class.some-class]="v">', []))).toEqual([
            [ElementAst, 'div'],
            [BoundElementPropertyAst, PropertyBindingType.Class, 'some-class', 'v', null]
          ]);
        });

        it('should parse mixed case bound classes', () => {
          expect(humanizeTplAst(parse('<div [class.someClass]="v">', []))).toEqual([
            [ElementAst, 'div'],
            [BoundElementPropertyAst, PropertyBindingType.Class, 'someClass', 'v', null]
          ]);
        });

        it('should parse mixed case bound styles', () => {
          expect(humanizeTplAst(parse('<div [style.someStyle]="v">', []))).toEqual([
            [ElementAst, 'div'],
            [BoundElementPropertyAst, PropertyBindingType.Style, 'someStyle', 'v', null]
          ]);
        });

        describe('errors', () => {
          it('should throw error when binding to an unknown property', () => {
            expect(() => parse('<my-component [invalidProp]="bar"></my-component>', []))
                .toThrowError(`Template parse errors:
Can't bind to 'invalidProp' since it isn't a known property of 'my-component'.
1. If 'my-component' is an Angular component and it has 'invalidProp' input, then verify that it is part of this module.
2. If 'my-component' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@NgModule.schemas' of this component to suppress this message.
3. To allow any property add 'NO_ERRORS_SCHEMA' to the '@NgModule.schemas' of this component. ("<my-component [ERROR ->][invalidProp]="bar"></my-component>"): TestComp@0:14`);
          });

          it('should throw error when binding to an unknown property of ng-container', () => {
            expect(() => parse('<ng-container [invalidProp]="bar"></ng-container>', []))
                .toThrowError(
                    `Template parse errors:
Can't bind to 'invalidProp' since it isn't a known property of 'ng-container'.
1. If 'invalidProp' is an Angular directive, then add 'CommonModule' to the '@NgModule.imports' of this component.
2. To allow any property add 'NO_ERRORS_SCHEMA' to the '@NgModule.schemas' of this component.` +
                    ` ("<ng-container [ERROR ->][invalidProp]="bar"></ng-container>"): TestComp@0:14`);
          });

          it('should throw error when binding to an unknown element w/o bindings', () => {
            expect(() => parse('<unknown></unknown>', [])).toThrowError(`Template parse errors:
'unknown' is not a known element:
1. If 'unknown' is an Angular component, then verify that it is part of this module.
2. To allow any element add 'NO_ERRORS_SCHEMA' to the '@NgModule.schemas' of this component. ("[ERROR ->]<unknown></unknown>"): TestComp@0:0`);
          });

          it('should throw error when binding to an unknown custom element w/o bindings', () => {
            expect(() => parse('<un-known></un-known>', [])).toThrowError(`Template parse errors:
'un-known' is not a known element:
1. If 'un-known' is an Angular component, then verify that it is part of this module.
2. If 'un-known' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@NgModule.schemas' of this component to suppress this message. ("[ERROR ->]<un-known></un-known>"): TestComp@0:0`);
          });

          it('should throw error when binding to an invalid property', () => {
            expect(() => parse('<my-component [onEvent]="bar"></my-component>', []))
                .toThrowError(`Template parse errors:
Binding to property 'onEvent' is disallowed for security reasons ("<my-component [ERROR ->][onEvent]="bar"></my-component>"): TestComp@0:14`);
          });

          it('should throw error when binding to an invalid attribute', () => {
            expect(() => parse('<my-component [attr.onEvent]="bar"></my-component>', []))
                .toThrowError(`Template parse errors:
Binding to attribute 'onEvent' is disallowed for security reasons ("<my-component [ERROR ->][attr.onEvent]="bar"></my-component>"): TestComp@0:14`);
          });
        });

        it('should parse bound properties via [...] and not report them as attributes', () => {
          expect(humanizeTplAst(parse('<div [prop]="v">', []))).toEqual([
            [ElementAst, 'div'],
            [BoundElementPropertyAst, PropertyBindingType.Property, 'prop', 'v', null]
          ]);
        });

        it('should parse bound properties via bind- and not report them as attributes', () => {
          expect(humanizeTplAst(parse('<div bind-prop="v">', []))).toEqual([
            [ElementAst, 'div'],
            [BoundElementPropertyAst, PropertyBindingType.Property, 'prop', 'v', null]
          ]);
        });

        it('should parse bound properties via {{...}} and not report them as attributes', () => {
          expect(humanizeTplAst(parse('<div prop="{{v}}">', []))).toEqual([
            [ElementAst, 'div'],
            [BoundElementPropertyAst, PropertyBindingType.Property, 'prop', '{{ v }}', null]
          ]);
        });

        it('should parse bound properties via bind-animate- and not report them as attributes',
           () => {
             expect(humanizeTplAst(parse('<div bind-animate-someAnimation="value2">', [], [], [])))
                 .toEqual([
                   [ElementAst, 'div'],
                   [
                     BoundElementPropertyAst, PropertyBindingType.Animation, 'someAnimation',
                     'value2', null
                   ]
                 ]);
           });

        it('should throw an error when parsing detects non-bound properties via @ that contain a value',
           () => {
             expect(() => { parse('<div @someAnimation="value2">', [], [], []); })
                 .toThrowError(
                     /Assigning animation triggers via @prop="exp" attributes with an expression is invalid. Use property bindings \(e.g. \[@prop\]="exp"\) or use an attribute without a value \(e.g. @prop\) instead. \("<div \[ERROR ->\]@someAnimation="value2">"\): TestComp@0:5/);
           });

        it('should not issue a warning when host attributes contain a valid property-bound animation trigger',
           () => {
             const animationEntries = [new CompileAnimationEntryMetadata('prop', [])];
             const dirA = compileDirectiveMetadataCreate({
                            selector: 'div',
                            template: compileTemplateMetadata({animations: animationEntries}),
                            type: createTypeMeta({
                              reference: {filePath: someModuleUrl, name: 'DirA'},
                            }),
                            host: {'[@prop]': 'expr'}
                          }).toSummary();

             humanizeTplAst(parse('<div></div>', [dirA]));
             expect(console.warnings.length).toEqual(0);
           });

        it('should throw descriptive error when a host binding is not a string expression', () => {
          const dirA = compileDirectiveMetadataCreate({
                         selector: 'broken',
                         type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirA'}}),
                         host: {'[class.foo]': null !}
                       }).toSummary();

          expect(() => { parse('<broken></broken>', [dirA]); })
              .toThrowError(
                  `Template parse errors:\nValue of the host property binding "class.foo" needs to be a string representing an expression but got "null" (object) ("[ERROR ->]<broken></broken>"): TestComp@0:0, Directive DirA`);
        });

        it('should throw descriptive error when a host event is not a string expression', () => {
          const dirA = compileDirectiveMetadataCreate({
                         selector: 'broken',
                         type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirA'}}),
                         host: {'(click)': null !}
                       }).toSummary();

          expect(() => { parse('<broken></broken>', [dirA]); })
              .toThrowError(
                  `Template parse errors:\nValue of the host listener "click" needs to be a string representing an expression but got "null" (object) ("[ERROR ->]<broken></broken>"): TestComp@0:0, Directive DirA`);
        });

        it('should not issue a warning when an animation property is bound without an expression',
           () => {
             humanizeTplAst(parse('<div @someAnimation>', [], [], []));
             expect(console.warnings.length).toEqual(0);
           });

        it('should parse bound properties via [@] and not report them as attributes', () => {
          expect(humanizeTplAst(parse('<div [@someAnimation]="value2">', [], [], []))).toEqual([
            [ElementAst, 'div'],
            [
              BoundElementPropertyAst, PropertyBindingType.Animation, 'someAnimation', 'value2',
              null
            ]
          ]);
        });
      });

      describe('events', () => {

        it('should parse bound events with a target', () => {
          expect(humanizeTplAst(parse('<div (window:event)="v">', []))).toEqual([
            [ElementAst, 'div'],
            [BoundEventAst, 'event', 'window', 'v'],
          ]);
        });

        it('should report an error on empty expression', () => {
          expect(() => parse('<div (event)="">', []))
              .toThrowError(/Empty expressions are not allowed/);

          expect(() => parse('<div (event)="  ">', []))
              .toThrowError(/Empty expressions are not allowed/);
        });

        it('should parse bound events via (...) and not report them as attributes', () => {
          expect(humanizeTplAst(parse('<div (event)="v">', [
          ]))).toEqual([[ElementAst, 'div'], [BoundEventAst, 'event', null, 'v']]);
        });

        it('should parse event names case sensitive', () => {
          expect(humanizeTplAst(parse('<div (some-event)="v">', [
          ]))).toEqual([[ElementAst, 'div'], [BoundEventAst, 'some-event', null, 'v']]);
          expect(humanizeTplAst(parse('<div (someEvent)="v">', [
          ]))).toEqual([[ElementAst, 'div'], [BoundEventAst, 'someEvent', null, 'v']]);
        });

        it('should parse bound events via on- and not report them as attributes', () => {
          expect(humanizeTplAst(parse('<div on-event="v">', [
          ]))).toEqual([[ElementAst, 'div'], [BoundEventAst, 'event', null, 'v']]);
        });

        it('should allow events on explicit embedded templates that are emitted by a directive',
           () => {
             const dirA =
                 compileDirectiveMetadataCreate({
                   selector: 'template,ng-template',
                   outputs: ['e'],
                   type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirA'}})
                 }).toSummary();

             expect(humanizeTplAst(parse('<template (e)="f"></template>', [dirA]))).toEqual([
               [EmbeddedTemplateAst],
               [BoundEventAst, 'e', null, 'f'],
               [DirectiveAst, dirA],
             ]);

             expect(humanizeTplAst(parse('<ng-template (e)="f"></ng-template>', [dirA]))).toEqual([
               [EmbeddedTemplateAst],
               [BoundEventAst, 'e', null, 'f'],
               [DirectiveAst, dirA],
             ]);
           });
      });

      describe('bindon', () => {
        it('should parse bound events and properties via [(...)] and not report them as attributes',
           () => {
             expect(humanizeTplAst(parse('<div [(prop)]="v">', []))).toEqual([
               [ElementAst, 'div'],
               [BoundElementPropertyAst, PropertyBindingType.Property, 'prop', 'v', null],
               [BoundEventAst, 'propChange', null, 'v = $event']
             ]);
           });

        it('should parse bound events and properties via bindon- and not report them as attributes',
           () => {
             expect(humanizeTplAst(parse('<div bindon-prop="v">', []))).toEqual([
               [ElementAst, 'div'],
               [BoundElementPropertyAst, PropertyBindingType.Property, 'prop', 'v', null],
               [BoundEventAst, 'propChange', null, 'v = $event']
             ]);
           });

      });

      describe('directives', () => {
        it('should order directives by the directives array in the View and match them only once',
           () => {
             const dirA =
                 compileDirectiveMetadataCreate({
                   selector: '[a]',
                   type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirA'}})
                 }).toSummary();
             const dirB =
                 compileDirectiveMetadataCreate({
                   selector: '[b]',
                   type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirB'}})
                 }).toSummary();
             const dirC =
                 compileDirectiveMetadataCreate({
                   selector: '[c]',
                   type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirC'}})
                 }).toSummary();
             expect(humanizeTplAst(parse('<div a c b a b>', [dirA, dirB, dirC]))).toEqual([
               [ElementAst, 'div'], [AttrAst, 'a', ''], [AttrAst, 'c', ''], [AttrAst, 'b', ''],
               [AttrAst, 'a', ''], [AttrAst, 'b', ''], [DirectiveAst, dirA], [DirectiveAst, dirB],
               [DirectiveAst, dirC]
             ]);
           });

        it('should parse directive dotted properties', () => {
          const dirA = compileDirectiveMetadataCreate({
                         selector: '[dot.name]',
                         type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirA'}}),
                         inputs: ['localName: dot.name'],
                       }).toSummary();

          expect(humanizeTplAst(parse('<div [dot.name]="expr"></div>', [dirA]))).toEqual([
            [ElementAst, 'div'],
            [DirectiveAst, dirA],
            [BoundDirectivePropertyAst, 'localName', 'expr'],
          ]);
        });

        it('should locate directives in property bindings', () => {
          const dirA =
              compileDirectiveMetadataCreate({
                selector: '[a=b]',
                type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirA'}})
              }).toSummary();
          const dirB =
              compileDirectiveMetadataCreate({
                selector: '[b]',
                type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirB'}})
              }).toSummary();
          expect(humanizeTplAst(parse('<div [a]="b">', [dirA, dirB]))).toEqual([
            [ElementAst, 'div'],
            [BoundElementPropertyAst, PropertyBindingType.Property, 'a', 'b', null],
            [DirectiveAst, dirA]
          ]);
        });

        it('should locate directives in inline templates', () => {
          const dirTemplate =
              compileDirectiveMetadataCreate({
                selector: 'template',
                type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'onTemplate'}})
              }).toSummary();
          expect(humanizeTplAst(parse('<div *ngIf="cond">', [ngIf, dirTemplate]))).toEqual([
            [EmbeddedTemplateAst],
            [DirectiveAst, ngIf],
            [BoundDirectivePropertyAst, 'ngIf', 'cond'],
            [DirectiveAst, dirTemplate],
            [ElementAst, 'div'],
          ]);
        });

        it('should locate directives in event bindings', () => {
          const dirA =
              compileDirectiveMetadataCreate({
                selector: '[a]',
                type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirB'}})
              }).toSummary();

          expect(humanizeTplAst(parse('<div (a)="b">', [dirA]))).toEqual([
            [ElementAst, 'div'], [BoundEventAst, 'a', null, 'b'], [DirectiveAst, dirA]
          ]);
        });

        it('should parse directive host properties', () => {
          const dirA = compileDirectiveMetadataCreate({
                         selector: 'div',
                         type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirA'}}),
                         host: {'[a]': 'expr'}
                       }).toSummary();
          expect(humanizeTplAst(parse('<div></div>', [dirA]))).toEqual([
            [ElementAst, 'div'], [DirectiveAst, dirA],
            [BoundElementPropertyAst, PropertyBindingType.Property, 'a', 'expr', null]
          ]);
        });

        it('should parse directive host listeners', () => {
          const dirA = compileDirectiveMetadataCreate({
                         selector: 'div',
                         type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirA'}}),
                         host: {'(a)': 'expr'}
                       }).toSummary();
          expect(humanizeTplAst(parse('<div></div>', [dirA]))).toEqual([
            [ElementAst, 'div'], [DirectiveAst, dirA], [BoundEventAst, 'a', null, 'expr']
          ]);
        });

        it('should parse directive properties', () => {
          const dirA = compileDirectiveMetadataCreate({
                         selector: 'div',
                         type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirA'}}),
                         inputs: ['aProp']
                       }).toSummary();
          expect(humanizeTplAst(parse('<div [aProp]="expr"></div>', [dirA]))).toEqual([
            [ElementAst, 'div'], [DirectiveAst, dirA],
            [BoundDirectivePropertyAst, 'aProp', 'expr']
          ]);
        });

        it('should parse renamed directive properties', () => {
          const dirA = compileDirectiveMetadataCreate({
                         selector: 'div',
                         type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirA'}}),
                         inputs: ['b:a']
                       }).toSummary();
          expect(humanizeTplAst(parse('<div [a]="expr"></div>', [dirA]))).toEqual([
            [ElementAst, 'div'], [DirectiveAst, dirA], [BoundDirectivePropertyAst, 'b', 'expr']
          ]);
        });

        it('should parse literal directive properties', () => {
          const dirA = compileDirectiveMetadataCreate({
                         selector: 'div',
                         type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirA'}}),
                         inputs: ['a']
                       }).toSummary();
          expect(humanizeTplAst(parse('<div a="literal"></div>', [dirA]))).toEqual([
            [ElementAst, 'div'], [AttrAst, 'a', 'literal'], [DirectiveAst, dirA],
            [BoundDirectivePropertyAst, 'a', '"literal"']
          ]);
        });

        it('should favor explicit bound properties over literal properties', () => {
          const dirA = compileDirectiveMetadataCreate({
                         selector: 'div',
                         type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirA'}}),
                         inputs: ['a']
                       }).toSummary();
          expect(humanizeTplAst(parse('<div a="literal" [a]="\'literal2\'"></div>', [dirA])))
              .toEqual([
                [ElementAst, 'div'], [AttrAst, 'a', 'literal'], [DirectiveAst, dirA],
                [BoundDirectivePropertyAst, 'a', '"literal2"']
              ]);
        });

        it('should support optional directive properties', () => {
          const dirA = compileDirectiveMetadataCreate({
                         selector: 'div',
                         type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirA'}}),
                         inputs: ['a']
                       }).toSummary();
          expect(humanizeTplAst(parse('<div></div>', [dirA]))).toEqual([
            [ElementAst, 'div'], [DirectiveAst, dirA]
          ]);
        });

      });

      describe('providers', () => {
        let nextProviderId: number;

        function createToken(value: string): CompileTokenMetadata {
          let token: CompileTokenMetadata;
          if (value.startsWith('type:')) {
            const name = value.substring(5);
            token = {identifier: createTypeMeta({reference: <any>name})};
          } else {
            token = {value: value};
          }
          return token;
        }

        function createDep(value: string): CompileDiDependencyMetadata {
          let isOptional = false;
          if (value.startsWith('optional:')) {
            isOptional = true;
            value = value.substring(9);
          }
          let isSelf = false;
          if (value.startsWith('self:')) {
            isSelf = true;
            value = value.substring(5);
          }
          let isHost = false;
          if (value.startsWith('host:')) {
            isHost = true;
            value = value.substring(5);
          }
          return {
            token: createToken(value),
            isOptional: isOptional,
            isSelf: isSelf,
            isHost: isHost
          };
        }

        function createProvider(
            token: string, {multi = false, deps = []}: {multi?: boolean, deps?: string[]} = {}):
            CompileProviderMetadata {
          const compileToken = createToken(token);
          return {
            token: compileToken,
            multi: multi,
            useClass: createTypeMeta({reference: tokenReference(compileToken)}),
            deps: deps.map(createDep),
            useExisting: undefined,
            useFactory: undefined,
            useValue: undefined
          };
        }

        function createDir(
            selector: string, {providers = null, viewProviders = null, deps = [], queries = []}: {
              providers?: CompileProviderMetadata[],
              viewProviders?: CompileProviderMetadata[],
              deps?: string[],
              queries?: string[]
            } = {}): CompileDirectiveSummary {
          const isComponent = !selector.startsWith('[');
          return compileDirectiveMetadataCreate({
                   selector: selector,
                   type: createTypeMeta({
                     reference: <any>selector,
                     diDeps: deps.map(createDep),
                   }),
                   isComponent: isComponent,
                   template: compileTemplateMetadata({ngContentSelectors: []}),
                   providers: providers,
                   viewProviders: viewProviders,
                   queries: queries.map((value) => {
                     return {
                       selectors: [createToken(value)],
                       descendants: false,
                       first: false,
                       propertyName: 'test',
                       read: undefined !
                     };
                   })
                 })
              .toSummary();
        }

        beforeEach(() => { nextProviderId = 0; });

        it('should provide a component', () => {
          const comp = createDir('my-comp');
          const elAst: ElementAst = <ElementAst>parse('<my-comp>', [comp])[0];
          expect(elAst.providers.length).toBe(1);
          expect(elAst.providers[0].providerType).toBe(ProviderAstType.Component);
          expect(elAst.providers[0].providers[0].useClass).toBe(comp.type);
        });

        it('should provide a directive', () => {
          const dirA = createDir('[dirA]');
          const elAst: ElementAst = <ElementAst>parse('<div dirA>', [dirA])[0];
          expect(elAst.providers.length).toBe(1);
          expect(elAst.providers[0].providerType).toBe(ProviderAstType.Directive);
          expect(elAst.providers[0].providers[0].useClass).toBe(dirA.type);
        });

        it('should use the public providers of a directive', () => {
          const provider = createProvider('service');
          const dirA = createDir('[dirA]', {providers: [provider]});
          const elAst: ElementAst = <ElementAst>parse('<div dirA>', [dirA])[0];
          expect(elAst.providers.length).toBe(2);
          expect(elAst.providers[0].providerType).toBe(ProviderAstType.PublicService);
          expect(elAst.providers[0].providers).toEqual([provider]);
        });

        it('should use the private providers of a component', () => {
          const provider = createProvider('service');
          const comp = createDir('my-comp', {viewProviders: [provider]});
          const elAst: ElementAst = <ElementAst>parse('<my-comp>', [comp])[0];
          expect(elAst.providers.length).toBe(2);
          expect(elAst.providers[0].providerType).toBe(ProviderAstType.PrivateService);
          expect(elAst.providers[0].providers).toEqual([provider]);
        });

        it('should support multi providers', () => {
          const provider0 = createProvider('service0', {multi: true});
          const provider1 = createProvider('service1', {multi: true});
          const provider2 = createProvider('service0', {multi: true});
          const dirA = createDir('[dirA]', {providers: [provider0, provider1]});
          const dirB = createDir('[dirB]', {providers: [provider2]});
          const elAst: ElementAst = <ElementAst>parse('<div dirA dirB>', [dirA, dirB])[0];
          expect(elAst.providers.length).toBe(4);
          expect(elAst.providers[0].providers).toEqual([provider0, provider2]);
          expect(elAst.providers[1].providers).toEqual([provider1]);
        });

        it('should overwrite non multi providers', () => {
          const provider1 = createProvider('service0');
          const provider2 = createProvider('service1');
          const provider3 = createProvider('service0');
          const dirA = createDir('[dirA]', {providers: [provider1, provider2]});
          const dirB = createDir('[dirB]', {providers: [provider3]});
          const elAst: ElementAst = <ElementAst>parse('<div dirA dirB>', [dirA, dirB])[0];
          expect(elAst.providers.length).toBe(4);
          expect(elAst.providers[0].providers).toEqual([provider3]);
          expect(elAst.providers[1].providers).toEqual([provider2]);
        });

        it('should overwrite component providers by directive providers', () => {
          const compProvider = createProvider('service0');
          const dirProvider = createProvider('service0');
          const comp = createDir('my-comp', {providers: [compProvider]});
          const dirA = createDir('[dirA]', {providers: [dirProvider]});
          const elAst: ElementAst = <ElementAst>parse('<my-comp dirA>', [dirA, comp])[0];
          expect(elAst.providers.length).toBe(3);
          expect(elAst.providers[0].providers).toEqual([dirProvider]);
        });

        it('should overwrite view providers by directive providers', () => {
          const viewProvider = createProvider('service0');
          const dirProvider = createProvider('service0');
          const comp = createDir('my-comp', {viewProviders: [viewProvider]});
          const dirA = createDir('[dirA]', {providers: [dirProvider]});
          const elAst: ElementAst = <ElementAst>parse('<my-comp dirA>', [dirA, comp])[0];
          expect(elAst.providers.length).toBe(3);
          expect(elAst.providers[0].providers).toEqual([dirProvider]);
        });

        it('should overwrite directives by providers', () => {
          const dirProvider = createProvider('type:my-comp');
          const comp = createDir('my-comp', {providers: [dirProvider]});
          const elAst: ElementAst = <ElementAst>parse('<my-comp>', [comp])[0];
          expect(elAst.providers.length).toBe(1);
          expect(elAst.providers[0].providers).toEqual([dirProvider]);
        });

        it('if mixing multi and non multi providers', () => {
          const provider0 = createProvider('service0');
          const provider1 = createProvider('service0', {multi: true});
          const dirA = createDir('[dirA]', {providers: [provider0]});
          const dirB = createDir('[dirB]', {providers: [provider1]});
          expect(() => parse('<div dirA dirB>', [dirA, dirB]))
              .toThrowError(
                  `Template parse errors:\n` +
                  `Mixing multi and non multi provider is not possible for token service0 ("[ERROR ->]<div dirA dirB>"): TestComp@0:0`);
        });

        it('should sort providers by their DI order, lazy providers first', () => {
          const provider0 = createProvider('service0', {deps: ['type:[dir2]']});
          const provider1 = createProvider('service1');
          const dir2 = createDir('[dir2]', {deps: ['service1']});
          const comp = createDir('my-comp', {providers: [provider0, provider1]});
          const elAst: ElementAst = <ElementAst>parse('<my-comp dir2>', [comp, dir2])[0];
          expect(elAst.providers.length).toBe(4);
          expect(elAst.providers[1].providers[0].useClass).toEqual(comp.type);
          expect(elAst.providers[2].providers).toEqual([provider1]);
          expect(elAst.providers[3].providers[0].useClass).toEqual(dir2.type);
          expect(elAst.providers[0].providers).toEqual([provider0]);
        });

        it('should sort directives by their DI order', () => {
          const dir0 = createDir('[dir0]', {deps: ['type:my-comp']});
          const dir1 = createDir('[dir1]', {deps: ['type:[dir0]']});
          const dir2 = createDir('[dir2]', {deps: ['type:[dir1]']});
          const comp = createDir('my-comp');
          const elAst: ElementAst =
              <ElementAst>parse('<my-comp dir2 dir0 dir1>', [comp, dir2, dir0, dir1])[0];
          expect(elAst.providers.length).toBe(4);
          expect(elAst.directives[0].directive).toBe(comp);
          expect(elAst.directives[1].directive).toBe(dir0);
          expect(elAst.directives[2].directive).toBe(dir1);
          expect(elAst.directives[3].directive).toBe(dir2);
        });

        it('should mark directives and dependencies of directives as eager', () => {
          const provider0 = createProvider('service0');
          const provider1 = createProvider('service1');
          const dirA = createDir('[dirA]', {providers: [provider0, provider1], deps: ['service0']});
          const elAst: ElementAst = <ElementAst>parse('<div dirA>', [dirA])[0];
          expect(elAst.providers.length).toBe(3);
          expect(elAst.providers[1].providers).toEqual([provider0]);
          expect(elAst.providers[1].eager).toBe(true);
          expect(elAst.providers[2].providers[0].useClass).toEqual(dirA.type);
          expect(elAst.providers[2].eager).toBe(true);
          expect(elAst.providers[0].providers).toEqual([provider1]);
          expect(elAst.providers[0].eager).toBe(false);
        });

        it('should mark dependencies on parent elements as eager', () => {
          const provider0 = createProvider('service0');
          const provider1 = createProvider('service1');
          const dirA = createDir('[dirA]', {providers: [provider0, provider1]});
          const dirB = createDir('[dirB]', {deps: ['service0']});
          const elAst: ElementAst =
              <ElementAst>parse('<div dirA><div dirB></div></div>', [dirA, dirB])[0];
          expect(elAst.providers.length).toBe(3);
          expect(elAst.providers[1].providers[0].useClass).toEqual(dirA.type);
          expect(elAst.providers[1].eager).toBe(true);
          expect(elAst.providers[2].providers).toEqual([provider0]);
          expect(elAst.providers[2].eager).toBe(true);
          expect(elAst.providers[0].providers).toEqual([provider1]);
          expect(elAst.providers[0].eager).toBe(false);
        });

        it('should mark queried providers as eager', () => {
          const provider0 = createProvider('service0');
          const provider1 = createProvider('service1');
          const dirA =
              createDir('[dirA]', {providers: [provider0, provider1], queries: ['service0']});
          const elAst: ElementAst = <ElementAst>parse('<div dirA></div>', [dirA])[0];
          expect(elAst.providers.length).toBe(3);
          expect(elAst.providers[1].providers[0].useClass).toEqual(dirA.type);
          expect(elAst.providers[1].eager).toBe(true);
          expect(elAst.providers[2].providers).toEqual([provider0]);
          expect(elAst.providers[2].eager).toBe(true);
          expect(elAst.providers[0].providers).toEqual([provider1]);
          expect(elAst.providers[0].eager).toBe(false);
        });

        it('should not mark dependencies across embedded views as eager', () => {
          const provider0 = createProvider('service0');
          const dirA = createDir('[dirA]', {providers: [provider0]});
          const dirB = createDir('[dirB]', {deps: ['service0']});
          const elAst: ElementAst =
              <ElementAst>parse('<div dirA><div *ngIf dirB></div></div>', [dirA, dirB])[0];
          expect(elAst.providers.length).toBe(2);
          expect(elAst.providers[1].providers[0].useClass).toEqual(dirA.type);
          expect(elAst.providers[1].eager).toBe(true);
          expect(elAst.providers[0].providers).toEqual([provider0]);
          expect(elAst.providers[0].eager).toBe(false);
        });

        it('should report missing @Self() deps as errors', () => {
          const dirA = createDir('[dirA]', {deps: ['self:provider0']});
          expect(() => parse('<div dirA></div>', [dirA]))
              .toThrowError(
                  'Template parse errors:\nNo provider for provider0 ("[ERROR ->]<div dirA></div>"): TestComp@0:0');
        });

        it('should change missing @Self() that are optional to nulls', () => {
          const dirA = createDir('[dirA]', {deps: ['optional:self:provider0']});
          const elAst: ElementAst = <ElementAst>parse('<div dirA></div>', [dirA])[0];
          expect(elAst.providers[0].providers[0].deps ![0].isValue).toBe(true);
          expect(elAst.providers[0].providers[0].deps ![0].value).toBe(null);
        });

        it('should report missing @Host() deps as errors', () => {
          const dirA = createDir('[dirA]', {deps: ['host:provider0']});
          expect(() => parse('<div dirA></div>', [dirA]))
              .toThrowError(
                  'Template parse errors:\nNo provider for provider0 ("[ERROR ->]<div dirA></div>"): TestComp@0:0');
        });

        it('should change missing @Host() that are optional to nulls', () => {
          const dirA = createDir('[dirA]', {deps: ['optional:host:provider0']});
          const elAst: ElementAst = <ElementAst>parse('<div dirA></div>', [dirA])[0];
          expect(elAst.providers[0].providers[0].deps ![0].isValue).toBe(true);
          expect(elAst.providers[0].providers[0].deps ![0].value).toBe(null);
        });
      });

      describe('references', () => {

        it('should parse references via #... and not report them as attributes', () => {
          expect(humanizeTplAst(parse('<div #a>', [
          ]))).toEqual([[ElementAst, 'div'], [ReferenceAst, 'a', null]]);
        });

        it('should parse references via ref-... and not report them as attributes', () => {
          expect(humanizeTplAst(parse('<div ref-a>', [
          ]))).toEqual([[ElementAst, 'div'], [ReferenceAst, 'a', null]]);
        });

        it('should parse camel case references', () => {
          expect(humanizeTplAst(parse('<div ref-someA>', [
          ]))).toEqual([[ElementAst, 'div'], [ReferenceAst, 'someA', null]]);
        });

        it('should assign references with empty value to the element', () => {
          expect(humanizeTplAst(parse('<div #a></div>', [
          ]))).toEqual([[ElementAst, 'div'], [ReferenceAst, 'a', null]]);
        });

        it('should assign references to directives via exportAs', () => {
          const dirA = compileDirectiveMetadataCreate({
                         selector: '[a]',
                         type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirA'}}),
                         exportAs: 'dirA'
                       }).toSummary();
          expect(humanizeTplAst(parse('<div a #a="dirA"></div>', [dirA]))).toEqual([
            [ElementAst, 'div'],
            [AttrAst, 'a', ''],
            [ReferenceAst, 'a', identifierToken(dirA.type)],
            [DirectiveAst, dirA],
          ]);
        });

        it('should report references with values that dont match a directive as errors', () => {
          expect(() => parse('<div #a="dirA"></div>', [])).toThrowError(`Template parse errors:
There is no directive with "exportAs" set to "dirA" ("<div [ERROR ->]#a="dirA"></div>"): TestComp@0:5`);
        });

        it('should report invalid reference names', () => {
          expect(() => parse('<div #a-b></div>', [])).toThrowError(`Template parse errors:
"-" is not allowed in reference names ("<div [ERROR ->]#a-b></div>"): TestComp@0:5`);
        });

        it('should report variables as errors', () => {
          expect(() => parse('<div let-a></div>', [])).toThrowError(`Template parse errors:
"let-" is only supported on template elements. ("<div [ERROR ->]let-a></div>"): TestComp@0:5`);
        });

        it('should report duplicate reference names', () => {
          expect(() => parse('<div #a></div><div #a></div>', []))
              .toThrowError(`Template parse errors:
Reference "#a" is defined several times ("<div #a></div><div [ERROR ->]#a></div>"): TestComp@0:19`);

        });

        it('should not throw error when there is same reference name in different templates',
           () => {
             expect(() => parse('<div #a><template #a><span>OK</span></template></div>', []))
                 .not.toThrowError();
             expect(() => parse('<div #a><ng-template #a><span>OK</span></ng-template></div>', []))
                 .not.toThrowError();
           });

        it('should assign references with empty value to components', () => {
          const dirA = compileDirectiveMetadataCreate({
                         selector: '[a]',
                         isComponent: true,
                         type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirA'}}),
                         exportAs: 'dirA',
                         template: compileTemplateMetadata({ngContentSelectors: []})
                       }).toSummary();
          expect(humanizeTplAst(parse('<div a #a></div>', [dirA]))).toEqual([
            [ElementAst, 'div'],
            [AttrAst, 'a', ''],
            [ReferenceAst, 'a', identifierToken(dirA.type)],
            [DirectiveAst, dirA],
          ]);
        });

        it('should not locate directives in references', () => {
          const dirA =
              compileDirectiveMetadataCreate({
                selector: '[a]',
                type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirA'}})
              }).toSummary();
          expect(humanizeTplAst(parse('<div ref-a>', [dirA]))).toEqual([
            [ElementAst, 'div'], [ReferenceAst, 'a', null]
          ]);
        });
      });

      describe('explicit templates', () => {
        it('should create embedded templates for <ng-template> elements', () => {
          expect(humanizeTplAst(parse('<template></template>', [
          ]))).toEqual([[EmbeddedTemplateAst]]);
          expect(humanizeTplAst(parse('<TEMPLATE></TEMPLATE>', [
          ]))).toEqual([[EmbeddedTemplateAst]]);
          expect(humanizeTplAst(parse('<ng-template></ng-template>', [
          ]))).toEqual([[EmbeddedTemplateAst]]);
        });

        it('should create embedded templates for <ng-template> elements regardless the namespace',
           () => {
             expect(humanizeTplAst(parse('<svg><template></template></svg>', []))).toEqual([
               [ElementAst, ':svg:svg'],
               [EmbeddedTemplateAst],
             ]);
             expect(humanizeTplAst(parse('<svg><ng-template></ng-template></svg>', []))).toEqual([
               [ElementAst, ':svg:svg'],
               [EmbeddedTemplateAst],
             ]);
           });

        it('should support references via #...', () => {
          expect(humanizeTplAst(parse('<template #a>', []))).toEqual([
            [EmbeddedTemplateAst],
            [ReferenceAst, 'a', createIdentifierToken(Identifiers.TemplateRef)],
          ]);
          expect(humanizeTplAst(parse('<ng-template #a>', []))).toEqual([
            [EmbeddedTemplateAst],
            [ReferenceAst, 'a', createIdentifierToken(Identifiers.TemplateRef)],
          ]);
        });

        it('should support references via ref-...', () => {
          expect(humanizeTplAst(parse('<template ref-a>', []))).toEqual([
            [EmbeddedTemplateAst],
            [ReferenceAst, 'a', createIdentifierToken(Identifiers.TemplateRef)]
          ]);
          expect(humanizeTplAst(parse('<ng-template ref-a>', []))).toEqual([
            [EmbeddedTemplateAst],
            [ReferenceAst, 'a', createIdentifierToken(Identifiers.TemplateRef)]
          ]);
        });

        it('should parse variables via let-...', () => {
          expect(humanizeTplAst(parse('<template let-a="b">', []))).toEqual([
            [EmbeddedTemplateAst],
            [VariableAst, 'a', 'b'],
          ]);
          expect(humanizeTplAst(parse('<ng-template let-a="b">', []))).toEqual([
            [EmbeddedTemplateAst],
            [VariableAst, 'a', 'b'],
          ]);
        });

        it('should not locate directives in variables', () => {
          const dirA =
              compileDirectiveMetadataCreate({
                selector: '[a]',
                type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirA'}})
              }).toSummary();
          expect(humanizeTplAst(parse('<template let-a="b"></template>', [dirA]))).toEqual([
            [EmbeddedTemplateAst],
            [VariableAst, 'a', 'b'],
          ]);
          expect(humanizeTplAst(parse('<ng-template let-a="b"></ng-template>', [dirA]))).toEqual([
            [EmbeddedTemplateAst],
            [VariableAst, 'a', 'b'],
          ]);
        });

      });

      describe('inline templates', () => {
        it('should wrap the element into an EmbeddedTemplateAST', () => {
          expect(humanizeTplAst(parse('<div template>', []))).toEqual([
            [EmbeddedTemplateAst],
            [ElementAst, 'div'],
          ]);
        });

        it('should wrap the element with data-template attribute into an EmbeddedTemplateAST ',
           () => {
             expect(humanizeTplAst(parse('<div data-template>', []))).toEqual([
               [EmbeddedTemplateAst],
               [ElementAst, 'div'],
             ]);
           });

        it('should parse bound properties', () => {
          expect(humanizeTplAst(parse('<div template="ngIf test">', [ngIf]))).toEqual([
            [EmbeddedTemplateAst],
            [DirectiveAst, ngIf],
            [BoundDirectivePropertyAst, 'ngIf', 'test'],
            [ElementAst, 'div'],
          ]);
        });

        it('should report an error on variables declared with #', () => {
          expect(() => humanizeTplAst(parse('<div *ngIf="#a=b">', [])))
              .toThrowError(/Parser Error: Unexpected token # at column 1/);
        });

        it('should parse variables via let ...', () => {
          const targetAst = [
            [EmbeddedTemplateAst],
            [VariableAst, 'a', 'b'],
            [ElementAst, 'div'],
          ];

          expect(humanizeTplAst(parse('<div *ngIf="let a=b">', []))).toEqual(targetAst);

          expect(humanizeTplAst(parse('<div data-*ngIf="let a=b">', []))).toEqual(targetAst);
        });

        it('should parse variables via as ...', () => {
          const targetAst = [
            [EmbeddedTemplateAst],
            [VariableAst, 'local', 'ngIf'],
            [DirectiveAst, ngIf],
            [BoundDirectivePropertyAst, 'ngIf', 'expr'],
            [ElementAst, 'div'],
          ];

          expect(humanizeTplAst(parse('<div *ngIf="expr as local">', [ngIf]))).toEqual(targetAst);
        });

        describe('directives', () => {
          it('should locate directives in property bindings', () => {
            const dirA =
                compileDirectiveMetadataCreate({
                  selector: '[a=b]',
                  type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirA'}}),
                  inputs: ['a']
                }).toSummary();
            const dirB =
                compileDirectiveMetadataCreate({
                  selector: '[b]',
                  type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirB'}})
                }).toSummary();
            expect(humanizeTplAst(parse('<div template="a b" b>', [dirA, dirB]))).toEqual([
              [EmbeddedTemplateAst], [DirectiveAst, dirA], [BoundDirectivePropertyAst, 'a', 'b'],
              [ElementAst, 'div'], [AttrAst, 'b', ''], [DirectiveAst, dirB]
            ]);
          });

          it('should not locate directives in variables', () => {
            const dirA =
                compileDirectiveMetadataCreate({
                  selector: '[a]',
                  type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirA'}})
                }).toSummary();
            expect(humanizeTplAst(parse('<div template="let a=b">', [dirA]))).toEqual([
              [EmbeddedTemplateAst], [VariableAst, 'a', 'b'], [ElementAst, 'div']
            ]);
          });

          it('should not locate directives in references', () => {
            const dirA =
                compileDirectiveMetadataCreate({
                  selector: '[a]',
                  type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirA'}})
                }).toSummary();
            expect(humanizeTplAst(parse('<div ref-a>', [dirA]))).toEqual([
              [ElementAst, 'div'], [ReferenceAst, 'a', null]
            ]);
          });

        });


        it('should work with *... and use the attribute name as property binding name', () => {
          expect(humanizeTplAst(parse('<div *ngIf="test">', [ngIf]))).toEqual([
            [EmbeddedTemplateAst],
            [DirectiveAst, ngIf],
            [BoundDirectivePropertyAst, 'ngIf', 'test'],
            [ElementAst, 'div'],

          ]);

          // https://github.com/angular/angular/issues/13800
          expect(humanizeTplAst(parse('<div *ngIf="-1">', [ngIf]))).toEqual([
            [EmbeddedTemplateAst],
            [DirectiveAst, ngIf],
            [BoundDirectivePropertyAst, 'ngIf', '0 - 1'],
            [ElementAst, 'div'],
          ]);
        });

        it('should work with *... and empty value', () => {
          expect(humanizeTplAst(parse('<div *ngIf>', [ngIf]))).toEqual([
            [EmbeddedTemplateAst],
            [DirectiveAst, ngIf],
            [BoundDirectivePropertyAst, 'ngIf', 'null'],
            [ElementAst, 'div'],
          ]);
        });
      });
    });

    describe('content projection', () => {
      let compCounter: number;
      beforeEach(() => { compCounter = 0; });

      function createComp(selector: string, ngContentSelectors: string[]): CompileDirectiveSummary {
        return compileDirectiveMetadataCreate({
                 selector: selector,
                 isComponent: true,
                 type: createTypeMeta(
                     {reference: {filePath: someModuleUrl, name: `SomeComp${compCounter++}`}}),
                 template: compileTemplateMetadata({ngContentSelectors: ngContentSelectors})
               })
            .toSummary();
      }

      function createDir(selector: string): CompileDirectiveSummary {
        return compileDirectiveMetadataCreate({
                 selector: selector,
                 type: createTypeMeta(
                     {reference: {filePath: someModuleUrl, name: `SomeDir${compCounter++}`}})
               })
            .toSummary();
      }

      describe('project text nodes', () => {
        it('should project text nodes with wildcard selector', () => {
          expect(humanizeContentProjection(parse('<div>hello</div>', [createComp('div', ['*'])])))
              .toEqual([
                ['div', null],
                ['#text(hello)', 0],
              ]);
        });
      });

      describe('project elements', () => {
        it('should project elements with wildcard selector', () => {
          expect(humanizeContentProjection(parse('<div><span></span></div>', [
            createComp('div', ['*'])
          ]))).toEqual([['div', null], ['span', 0]]);
        });

        it('should project elements with css selector', () => {
          expect(humanizeContentProjection(
                     parse('<div><a x></a><b></b></div>', [createComp('div', ['a[x]'])])))
              .toEqual([
                ['div', null],
                ['a', 0],
                ['b', null],
              ]);
        });
      });

      describe('embedded templates', () => {
        it('should project embedded templates with wildcard selector', () => {
          expect(humanizeContentProjection(parse(
                     '<div><template></template><ng-template></ng-template></div>',
                     [createComp('div', ['*'])])))
              .toEqual([
                ['div', null],
                ['template', 0],
                ['template', 0],
              ]);
        });

        it('should project embedded templates with css selector', () => {
          expect(humanizeContentProjection(parse(
                     '<div><ng-template x></ng-template><ng-template></ng-template></div>',
                     [createComp('div', ['ng-template[x]'])])))
              .toEqual([
                ['div', null],
                ['template', 0],
                ['template', null],
              ]);
        });
      });

      describe('ng-content', () => {
        it('should project ng-content with wildcard selector', () => {
          expect(humanizeContentProjection(parse('<div><ng-content></ng-content></div>', [
            createComp('div', ['*'])
          ]))).toEqual([['div', null], ['ng-content', 0]]);
        });

        it('should project ng-content with css selector', () => {
          expect(humanizeContentProjection(parse(
                     '<div><ng-content x></ng-content><ng-content></ng-content></div>',
                     [createComp('div', ['ng-content[x]'])])))
              .toEqual([['div', null], ['ng-content', 0], ['ng-content', null]]);
        });
      });

      it('should project into the first matching ng-content', () => {
        expect(humanizeContentProjection(parse('<div>hello<b></b><a></a></div>', [
          createComp('div', ['a', 'b', '*'])
        ]))).toEqual([['div', null], ['#text(hello)', 2], ['b', 1], ['a', 0]]);
      });

      it('should project into wildcard ng-content last', () => {
        expect(humanizeContentProjection(parse('<div>hello<a></a></div>', [
          createComp('div', ['*', 'a'])
        ]))).toEqual([['div', null], ['#text(hello)', 0], ['a', 1]]);
      });

      it('should only project direct child nodes', () => {
        expect(humanizeContentProjection(parse('<div><span><a></a></span><a></a></div>', [
          createComp('div', ['a'])
        ]))).toEqual([['div', null], ['span', null], ['a', null], ['a', 0]]);
      });

      it('should project nodes of nested components', () => {
        expect(humanizeContentProjection(parse('<a><b>hello</b></a>', [
          createComp('a', ['*']), createComp('b', ['*'])
        ]))).toEqual([['a', null], ['b', 0], ['#text(hello)', 0]]);
      });

      it('should project children of components with ngNonBindable', () => {
        expect(humanizeContentProjection(parse('<div ngNonBindable>{{hello}}<span></span></div>', [
          createComp('div', ['*'])
        ]))).toEqual([['div', null], ['#text({{hello}})', 0], ['span', 0]]);
      });

      it('should match the element when there is an inline template', () => {
        expect(humanizeContentProjection(parse('<div><b *ngIf="cond"></b></div>', [
          createComp('div', ['a', 'b']), ngIf
        ]))).toEqual([['div', null], ['template', 1], ['b', null]]);
      });

      describe('ngProjectAs', () => {
        it('should override elements', () => {
          expect(humanizeContentProjection(parse('<div><a ngProjectAs="b"></a></div>', [
            createComp('div', ['a', 'b'])
          ]))).toEqual([['div', null], ['a', 1]]);
        });

        it('should override <ng-content>', () => {
          expect(humanizeContentProjection(parse(
                     '<div><ng-content ngProjectAs="b"></ng-content></div>',
                     [createComp('div', ['ng-content', 'b'])])))
              .toEqual([['div', null], ['ng-content', 1]]);
        });

        it('should override <ng-template>', () => {
          expect(
              humanizeContentProjection(parse(
                  '<div><template ngProjectAs="b"></template><ng-template ngProjectAs="b"></ng-template></div>',
                  [createComp('div', ['template', 'b'])])))
              .toEqual([
                ['div', null],
                ['template', 1],
                ['template', 1],
              ]);
        });

        it('should override inline templates', () => {
          expect(humanizeContentProjection(parse(
                     '<div><a *ngIf="cond" ngProjectAs="b"></a></div>',
                     [createComp('div', ['a', 'b']), ngIf])))
              .toEqual([
                ['div', null],
                ['template', 1],
                ['a', null],
              ]);
        });
      });

      it('should support other directives before the component', () => {
        expect(humanizeContentProjection(parse('<div>hello</div>', [
          createDir('div'), createComp('div', ['*'])
        ]))).toEqual([['div', null], ['#text(hello)', 0]]);
      });
    });

    describe('splitClasses', () => {
      it('should keep an empty class', () => { expect(splitClasses('a')).toEqual(['a']); });

      it('should split 2 classes', () => { expect(splitClasses('a b')).toEqual(['a', 'b']); });

      it('should trim classes', () => { expect(splitClasses(' a  b ')).toEqual(['a', 'b']); });
    });

    describe('error cases', () => {
      it('should report when ng-content has non WS content', () => {
        expect(() => parse('<ng-content>content</ng-content>', []))
            .toThrowError(
                `Template parse errors:\n` +
                `<ng-content> element cannot have content. ("[ERROR ->]<ng-content>content</ng-content>"): TestComp@0:0`);
      });

      it('should treat *attr on a template element as valid', () => {
        expect(() => parse('<template *ngIf>', [])).not.toThrowError();
        expect(() => parse('<ng-template *ngIf>', [])).not.toThrowError();
      });

      it('should treat template attribute on a template element as valid', () => {
        expect(() => parse('<template template="ngIf">', [])).not.toThrowError();
        expect(() => parse('<ng-template template="ngIf">', [])).not.toThrowError();
      });

      it('should report when multiple *attrs are used on the same element', () => {
        expect(() => parse('<div *ngIf *ngFor>', [])).toThrowError(`Template parse errors:
Can't have multiple template bindings on one element. Use only one attribute named 'template' or prefixed with * ("<div *ngIf [ERROR ->]*ngFor>"): TestComp@0:11`);
      });

      it('should report when mix of template and *attrs are used on the same element', () => {
        expect(() => parse('<span template="ngIf" *ngFor>', []))
            .toThrowError(`Template parse errors:
Can't have multiple template bindings on one element. Use only one attribute named 'template' or prefixed with * ("<span template="ngIf" [ERROR ->]*ngFor>"): TestComp@0:22`);
      });

      it('should report invalid property names', () => {
        expect(() => parse('<div [invalidProp]></div>', [])).toThrowError(`Template parse errors:
Can't bind to 'invalidProp' since it isn't a known property of 'div'. ("<div [ERROR ->][invalidProp]></div>"): TestComp@0:5`);
      });

      it('should report invalid host property names', () => {
        const dirA = compileDirectiveMetadataCreate({
                       selector: 'div',
                       type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirA'}}),
                       host: {'[invalidProp]': 'someProp'}
                     }).toSummary();
        expect(() => parse('<div></div>', [dirA])).toThrowError(`Template parse errors:
Can't bind to 'invalidProp' since it isn't a known property of 'div'. ("[ERROR ->]<div></div>"): TestComp@0:0, Directive DirA`);
      });

      it('should report errors in expressions', () => {
        expect(() => parse('<div [prop]="a b"></div>', [])).toThrowError(`Template parse errors:
Parser Error: Unexpected token 'b' at column 3 in [a b] in TestComp@0:5 ("<div [ERROR ->][prop]="a b"></div>"): TestComp@0:5`);
      });

      it('should not throw on invalid property names if the property is used by a directive',
         () => {
           const dirA =
               compileDirectiveMetadataCreate({
                 selector: 'div',
                 type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirA'}}),
                 inputs: ['invalidProp']
               }).toSummary();
           expect(() => parse('<div [invalid-prop]></div>', [dirA])).not.toThrow();
         });

      it('should not allow more than 1 component per element', () => {
        const dirA = compileDirectiveMetadataCreate({
                       selector: 'div',
                       isComponent: true,
                       type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirA'}}),
                       template: compileTemplateMetadata({ngContentSelectors: []})
                     }).toSummary();
        const dirB = compileDirectiveMetadataCreate({
                       selector: 'div',
                       isComponent: true,
                       type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirB'}}),
                       template: compileTemplateMetadata({ngContentSelectors: []})
                     }).toSummary();
        expect(() => parse('<div>', [dirB, dirA]))
            .toThrowError(
                `Template parse errors:\n` +
                `More than one component matched on this element.\n` +
                `Make sure that only one component's selector can match a given element.\n` +
                `Conflicting components: DirB,DirA ("[ERROR ->]<div>"): TestComp@0:0`);
      });

      it('should not allow components or element bindings nor dom events on explicit embedded templates',
         () => {
           const dirA =
               compileDirectiveMetadataCreate({
                 selector: '[a]',
                 isComponent: true,
                 type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirA'}}),
                 template: compileTemplateMetadata({ngContentSelectors: []})
               }).toSummary();

           expect(() => parse('<template [a]="b" (e)="f"></template>', [dirA]))
               .toThrowError(`Template parse errors:
Event binding e not emitted by any directive on an embedded template. Make sure that the event name is spelled correctly and all directives are listed in the "@NgModule.declarations". ("<template [a]="b" [ERROR ->](e)="f"></template>"): TestComp@0:18
Components on an embedded template: DirA ("[ERROR ->]<template [a]="b" (e)="f"></template>"): TestComp@0:0
Property binding a not used by any directive on an embedded template. Make sure that the property name is spelled correctly and all directives are listed in the "@NgModule.declarations". ("[ERROR ->]<template [a]="b" (e)="f"></template>"): TestComp@0:0`);

           expect(() => parse('<ng-template [a]="b" (e)="f"></ng-template>', [dirA]))
               .toThrowError(`Template parse errors:
Event binding e not emitted by any directive on an embedded template. Make sure that the event name is spelled correctly and all directives are listed in the "@NgModule.declarations". ("<ng-template [a]="b" [ERROR ->](e)="f"></ng-template>"): TestComp@0:21
Components on an embedded template: DirA ("[ERROR ->]<ng-template [a]="b" (e)="f"></ng-template>"): TestComp@0:0
Property binding a not used by any directive on an embedded template. Make sure that the property name is spelled correctly and all directives are listed in the "@NgModule.declarations". ("[ERROR ->]<ng-template [a]="b" (e)="f"></ng-template>"): TestComp@0:0`);
         });

      it('should not allow components or element bindings on inline embedded templates', () => {
        const dirA = compileDirectiveMetadataCreate({
                       selector: '[a]',
                       isComponent: true,
                       type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirA'}}),
                       template: compileTemplateMetadata({ngContentSelectors: []})
                     }).toSummary();
        expect(() => parse('<div *a="b"></div>', [dirA])).toThrowError(`Template parse errors:
Components on an embedded template: DirA ("[ERROR ->]<div *a="b"></div>"): TestComp@0:0
Property binding a not used by any directive on an embedded template. Make sure that the property name is spelled correctly and all directives are listed in the "@NgModule.declarations". ("[ERROR ->]<div *a="b"></div>"): TestComp@0:0`);
      });
    });

    describe('ignore elements', () => {
      it('should ignore <script> elements', () => {
        expect(humanizeTplAst(parse('<script></script>a', []))).toEqual([[TextAst, 'a']]);

      });

      it('should ignore <style> elements', () => {
        expect(humanizeTplAst(parse('<style></style>a', []))).toEqual([[TextAst, 'a']]);
      });

      describe('<link rel="stylesheet">', () => {

        it('should keep <link rel="stylesheet"> elements if they have an absolute non package: url',
           () => {
             expect(humanizeTplAst(parse('<link rel="stylesheet" href="http://someurl">a', [])))
                 .toEqual([
                   [ElementAst, 'link'], [AttrAst, 'rel', 'stylesheet'],
                   [AttrAst, 'href', 'http://someurl'], [TextAst, 'a']
                 ]);
           });

        it('should keep <link rel="stylesheet"> elements if they have no uri', () => {
          expect(humanizeTplAst(parse('<link rel="stylesheet">a', [
          ]))).toEqual([[ElementAst, 'link'], [AttrAst, 'rel', 'stylesheet'], [TextAst, 'a']]);
          expect(humanizeTplAst(parse('<link REL="stylesheet">a', [
          ]))).toEqual([[ElementAst, 'link'], [AttrAst, 'REL', 'stylesheet'], [TextAst, 'a']]);
        });

        it('should ignore <link rel="stylesheet"> elements if they have a relative uri', () => {
          expect(humanizeTplAst(parse('<link rel="stylesheet" href="./other.css">a', [
          ]))).toEqual([[TextAst, 'a']]);
          expect(humanizeTplAst(parse('<link rel="stylesheet" HREF="./other.css">a', [
          ]))).toEqual([[TextAst, 'a']]);
        });

        it('should ignore <link rel="stylesheet"> elements if they have a package: uri', () => {
          expect(humanizeTplAst(parse('<link rel="stylesheet" href="package:somePackage">a', [
          ]))).toEqual([[TextAst, 'a']]);
        });

      });

      it('should ignore bindings on children of elements with ngNonBindable', () => {
        expect(humanizeTplAst(parse('<div ngNonBindable>{{b}}</div>', [
        ]))).toEqual([[ElementAst, 'div'], [AttrAst, 'ngNonBindable', ''], [TextAst, '{{b}}']]);
      });

      it('should keep nested children of elements with ngNonBindable', () => {
        expect(humanizeTplAst(parse('<div ngNonBindable><span>{{b}}</span></div>', []))).toEqual([
          [ElementAst, 'div'], [AttrAst, 'ngNonBindable', ''], [ElementAst, 'span'],
          [TextAst, '{{b}}']
        ]);
      });

      it('should ignore <script> elements inside of elements with ngNonBindable', () => {
        expect(humanizeTplAst(parse('<div ngNonBindable><script></script>a</div>', [
        ]))).toEqual([[ElementAst, 'div'], [AttrAst, 'ngNonBindable', ''], [TextAst, 'a']]);
      });

      it('should ignore <style> elements inside of elements with ngNonBindable', () => {
        expect(humanizeTplAst(parse('<div ngNonBindable><style></style>a</div>', [
        ]))).toEqual([[ElementAst, 'div'], [AttrAst, 'ngNonBindable', ''], [TextAst, 'a']]);
      });

      it('should ignore <link rel="stylesheet"> elements inside of elements with ngNonBindable',
         () => {
           expect(humanizeTplAst(parse('<div ngNonBindable><link rel="stylesheet">a</div>', [
           ]))).toEqual([[ElementAst, 'div'], [AttrAst, 'ngNonBindable', ''], [TextAst, 'a']]);
         });

      it('should convert <ng-content> elements into regular elements inside of elements with ngNonBindable',
         () => {
           expect(humanizeTplAst(parse('<div ngNonBindable><ng-content></ng-content>a</div>', [])))
               .toEqual([
                 [ElementAst, 'div'], [AttrAst, 'ngNonBindable', ''], [ElementAst, 'ng-content'],
                 [TextAst, 'a']
               ]);
         });

    });

    describe('source spans', () => {
      it('should support ng-content', () => {
        const parsed = parse('<ng-content select="a">', []);
        expect(humanizeTplAstSourceSpans(parsed)).toEqual([
          [NgContentAst, '<ng-content select="a">']
        ]);
      });

      it('should support embedded template', () => {
        expect(humanizeTplAstSourceSpans(parse('<template></template>', [
        ]))).toEqual([[EmbeddedTemplateAst, '<template>']]);
        expect(humanizeTplAstSourceSpans(parse('<ng-template></ng-template>', [
        ]))).toEqual([[EmbeddedTemplateAst, '<ng-template>']]);
      });

      it('should support element and attributes', () => {
        expect(humanizeTplAstSourceSpans(parse('<div key=value>', []))).toEqual([
          [ElementAst, 'div', '<div key=value>'], [AttrAst, 'key', 'value', 'key=value']
        ]);

      });

      it('should support references', () => {
        expect(humanizeTplAstSourceSpans(parse('<div #a></div>', [
        ]))).toEqual([[ElementAst, 'div', '<div #a>'], [ReferenceAst, 'a', null, '#a']]);
      });

      it('should support variables', () => {
        expect(humanizeTplAstSourceSpans(parse('<template let-a="b"></template>', []))).toEqual([
          [EmbeddedTemplateAst, '<template let-a="b">'],
          [VariableAst, 'a', 'b', 'let-a="b"'],
        ]);
        expect(humanizeTplAstSourceSpans(parse('<ng-template let-a="b"></ng-template>', [])))
            .toEqual([
              [EmbeddedTemplateAst, '<ng-template let-a="b">'],
              [VariableAst, 'a', 'b', 'let-a="b"'],
            ]);
      });

      it('should support events', () => {
        expect(humanizeTplAstSourceSpans(parse('<div (window:event)="v">', []))).toEqual([
          [ElementAst, 'div', '<div (window:event)="v">'],
          [BoundEventAst, 'event', 'window', 'v', '(window:event)="v"']
        ]);

      });

      it('should support element property', () => {
        expect(humanizeTplAstSourceSpans(parse('<div [someProp]="v">', []))).toEqual([
          [ElementAst, 'div', '<div [someProp]="v">'],
          [
            BoundElementPropertyAst, PropertyBindingType.Property, 'someProp', 'v', null,
            '[someProp]="v"'
          ]
        ]);
      });

      it('should support bound text', () => {
        expect(humanizeTplAstSourceSpans(parse('{{a}}', [
        ]))).toEqual([[BoundTextAst, '{{ a }}', '{{a}}']]);
      });

      it('should support text nodes', () => {
        expect(humanizeTplAstSourceSpans(parse('a', []))).toEqual([[TextAst, 'a', 'a']]);
      });

      it('should support directive', () => {
        const dirA = compileDirectiveMetadataCreate({
                       selector: '[a]',
                       type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirA'}})
                     }).toSummary();
        const comp = compileDirectiveMetadataCreate({
                       selector: 'div',
                       isComponent: true,
                       type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'ZComp'}}),
                       template: compileTemplateMetadata({ngContentSelectors: []})
                     }).toSummary();
        expect(humanizeTplAstSourceSpans(parse('<div a>', [dirA, comp]))).toEqual([
          [ElementAst, 'div', '<div a>'], [AttrAst, 'a', '', 'a'], [DirectiveAst, dirA, '<div a>'],
          [DirectiveAst, comp, '<div a>']
        ]);
      });

      it('should support directive in namespace', () => {
        const tagSel =
            compileDirectiveMetadataCreate({
              selector: 'circle',
              type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'elDir'}})
            }).toSummary();
        const attrSel =
            compileDirectiveMetadataCreate({
              selector: '[href]',
              type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'attrDir'}})
            }).toSummary();

        expect(humanizeTplAstSourceSpans(
                   parse('<svg><circle /><use xlink:href="Port" /></svg>', [tagSel, attrSel])))
            .toEqual([
              [ElementAst, ':svg:svg', '<svg>'],
              [ElementAst, ':svg:circle', '<circle />'],
              [DirectiveAst, tagSel, '<circle />'],
              [ElementAst, ':svg:use', '<use xlink:href="Port" />'],
              [AttrAst, ':xlink:href', 'Port', 'xlink:href="Port"'],
              [DirectiveAst, attrSel, '<use xlink:href="Port" />'],
            ]);
      });

      it('should support directive property', () => {
        const dirA = compileDirectiveMetadataCreate({
                       selector: 'div',
                       type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirA'}}),
                       inputs: ['aProp']
                     }).toSummary();
        expect(humanizeTplAstSourceSpans(parse('<div [aProp]="foo"></div>', [dirA]))).toEqual([
          [ElementAst, 'div', '<div [aProp]="foo">'], [DirectiveAst, dirA, '<div [aProp]="foo">'],
          [BoundDirectivePropertyAst, 'aProp', 'foo', '[aProp]="foo"']
        ]);
      });

      it('should support endSourceSpan for elements', () => {
        const tagSel =
            compileDirectiveMetadataCreate({
              selector: 'circle',
              type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'elDir'}})
            }).toSummary();
        const result = parse('<circle></circle>', [tagSel]);
        const circle = result[0] as ElementAst;
        expect(circle.endSourceSpan).toBeDefined();
        expect(circle.endSourceSpan !.start.offset).toBe(8);
        expect(circle.endSourceSpan !.end.offset).toBe(17);
      });

      it('should report undefined for endSourceSpan for elements without an end-tag', () => {
        const ulSel =
            compileDirectiveMetadataCreate({
              selector: 'ul',
              type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'ulDir'}})
            }).toSummary();
        const liSel =
            compileDirectiveMetadataCreate({
              selector: 'li',
              type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'liDir'}})
            }).toSummary();
        const result = parse('<ul><li><li></ul>', [ulSel, liSel]);
        const ul = result[0] as ElementAst;
        const li = ul.children[0] as ElementAst;
        expect(li.endSourceSpan).toBe(null);
      });
    });

    describe('pipes', () => {
      it('should allow pipes that have been defined as dependencies', () => {
        const testPipe =
            new CompilePipeMetadata({
              name: 'test',
              type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirA'}}),
              pure: false
            }).toSummary();
        expect(() => parse('{{a | test}}', [], [testPipe])).not.toThrow();
      });

      it('should report pipes as error that have not been defined as dependencies', () => {
        expect(() => parse('{{a | test}}', [])).toThrowError(`Template parse errors:
The pipe 'test' could not be found ("{{[ERROR ->]a | test}}"): TestComp@0:2`);
      });

    });

    describe('ICU messages', () => {
      it('should expand plural messages', () => {
        const shortForm = '{ count, plural, =0 {small} many {big} }';
        const expandedForm = '<ng-container [ngPlural]="count">' +
            '<ng-template ngPluralCase="=0">small</ng-template>' +
            '<ng-template ngPluralCase="many">big</ng-template>' +
            '</ng-container>';

        expect(humanizeTplAst(parse(shortForm, []))).toEqual(humanizeTplAst(parse(expandedForm, [
        ])));
      });

      it('should expand select messages', () => {
        const shortForm = '{ sex, select, female {foo} other {bar} }';
        const expandedForm = '<ng-container [ngSwitch]="sex">' +
            '<ng-template ngSwitchCase="female">foo</ng-template>' +
            '<ng-template ngSwitchDefault>bar</ng-template>' +
            '</ng-container>';

        expect(humanizeTplAst(parse(shortForm, []))).toEqual(humanizeTplAst(parse(expandedForm, [
        ])));
      });

      it('should be possible to escape ICU messages', () => {
        const escapedForm = 'escaped {{ "{" }}  }';

        expect(humanizeTplAst(parse(escapedForm, []))).toEqual([
          [BoundTextAst, 'escaped {{ "{" }}  }'],
        ]);
      });
    });
  });

  describe('Template Parser - opt-out `<template>` support', () => {
    beforeEach(() => {
      TestBed.configureCompiler({
        providers: [{
          provide: CompilerConfig,
          useValue: new CompilerConfig({enableLegacyTemplate: false}),
        }],
      });
    });

    commonBeforeEach();

    it('should support * directives', () => {
      expect(humanizeTplAst(parse('<div *ngIf>', [ngIf]))).toEqual([
        [EmbeddedTemplateAst],
        [DirectiveAst, ngIf],
        [BoundDirectivePropertyAst, 'ngIf', 'null'],
        [ElementAst, 'div'],
      ]);
    });

    it('should support <ng-template>', () => {
      expect(humanizeTplAst(parse('<ng-template>', []))).toEqual([
        [EmbeddedTemplateAst],
      ]);
    });

    it('should treat <template> as a regular tag', () => {
      expect(humanizeTplAst(parse('<template>', []))).toEqual([
        [ElementAst, 'template'],
      ]);
    });

    it('should not special case the template attribute', () => {
      expect(humanizeTplAst(parse('<p template="ngFor">', []))).toEqual([
        [ElementAst, 'p'],
        [AttrAst, 'template', 'ngFor'],
      ]);
    });
  });
}

function humanizeTplAst(
    templateAsts: TemplateAst[], interpolationConfig?: InterpolationConfig): any[] {
  const humanizer = new TemplateHumanizer(false, interpolationConfig);
  templateVisitAll(humanizer, templateAsts);
  return humanizer.result;
}

function humanizeTplAstSourceSpans(
    templateAsts: TemplateAst[], interpolationConfig?: InterpolationConfig): any[] {
  const humanizer = new TemplateHumanizer(true, interpolationConfig);
  templateVisitAll(humanizer, templateAsts);
  return humanizer.result;
}

class TemplateHumanizer implements TemplateAstVisitor {
  result: any[] = [];

  constructor(
      private includeSourceSpan: boolean,
      private interpolationConfig: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG){};

  visitNgContent(ast: NgContentAst, context: any): any {
    const res = [NgContentAst];
    this.result.push(this._appendContext(ast, res));
    return null;
  }
  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any {
    const res = [EmbeddedTemplateAst];
    this.result.push(this._appendContext(ast, res));
    templateVisitAll(this, ast.attrs);
    templateVisitAll(this, ast.outputs);
    templateVisitAll(this, ast.references);
    templateVisitAll(this, ast.variables);
    templateVisitAll(this, ast.directives);
    templateVisitAll(this, ast.children);
    return null;
  }
  visitElement(ast: ElementAst, context: any): any {
    const res = [ElementAst, ast.name];
    this.result.push(this._appendContext(ast, res));
    templateVisitAll(this, ast.attrs);
    templateVisitAll(this, ast.inputs);
    templateVisitAll(this, ast.outputs);
    templateVisitAll(this, ast.references);
    templateVisitAll(this, ast.directives);
    templateVisitAll(this, ast.children);
    return null;
  }
  visitReference(ast: ReferenceAst, context: any): any {
    const res = [ReferenceAst, ast.name, ast.value];
    this.result.push(this._appendContext(ast, res));
    return null;
  }
  visitVariable(ast: VariableAst, context: any): any {
    const res = [VariableAst, ast.name, ast.value];
    this.result.push(this._appendContext(ast, res));
    return null;
  }
  visitEvent(ast: BoundEventAst, context: any): any {
    const res =
        [BoundEventAst, ast.name, ast.target, unparse(ast.handler, this.interpolationConfig)];
    this.result.push(this._appendContext(ast, res));
    return null;
  }
  visitElementProperty(ast: BoundElementPropertyAst, context: any): any {
    const res = [
      BoundElementPropertyAst, ast.type, ast.name, unparse(ast.value, this.interpolationConfig),
      ast.unit
    ];
    this.result.push(this._appendContext(ast, res));
    return null;
  }
  visitAttr(ast: AttrAst, context: any): any {
    const res = [AttrAst, ast.name, ast.value];
    this.result.push(this._appendContext(ast, res));
    return null;
  }
  visitBoundText(ast: BoundTextAst, context: any): any {
    const res = [BoundTextAst, unparse(ast.value, this.interpolationConfig)];
    this.result.push(this._appendContext(ast, res));
    return null;
  }
  visitText(ast: TextAst, context: any): any {
    const res = [TextAst, ast.value];
    this.result.push(this._appendContext(ast, res));
    return null;
  }
  visitDirective(ast: DirectiveAst, context: any): any {
    const res = [DirectiveAst, ast.directive];
    this.result.push(this._appendContext(ast, res));
    templateVisitAll(this, ast.inputs);
    templateVisitAll(this, ast.hostProperties);
    templateVisitAll(this, ast.hostEvents);
    return null;
  }
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any {
    const res = [
      BoundDirectivePropertyAst, ast.directiveName, unparse(ast.value, this.interpolationConfig)
    ];
    this.result.push(this._appendContext(ast, res));
    return null;
  }

  private _appendContext(ast: TemplateAst, input: any[]): any[] {
    if (!this.includeSourceSpan) return input;
    input.push(ast.sourceSpan !.toString());
    return input;
  }
}

function humanizeContentProjection(templateAsts: TemplateAst[]): any[] {
  const humanizer = new TemplateContentProjectionHumanizer();
  templateVisitAll(humanizer, templateAsts);
  return humanizer.result;
}

class TemplateContentProjectionHumanizer implements TemplateAstVisitor {
  result: any[] = [];
  visitNgContent(ast: NgContentAst, context: any): any {
    this.result.push(['ng-content', ast.ngContentIndex]);
    return null;
  }
  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any {
    this.result.push(['template', ast.ngContentIndex]);
    templateVisitAll(this, ast.children);
    return null;
  }
  visitElement(ast: ElementAst, context: any): any {
    this.result.push([ast.name, ast.ngContentIndex]);
    templateVisitAll(this, ast.children);
    return null;
  }
  visitReference(ast: ReferenceAst, context: any): any { return null; }
  visitVariable(ast: VariableAst, context: any): any { return null; }
  visitEvent(ast: BoundEventAst, context: any): any { return null; }
  visitElementProperty(ast: BoundElementPropertyAst, context: any): any { return null; }
  visitAttr(ast: AttrAst, context: any): any { return null; }
  visitBoundText(ast: BoundTextAst, context: any): any {
    this.result.push([`#text(${unparse(ast.value)})`, ast.ngContentIndex]);
    return null;
  }
  visitText(ast: TextAst, context: any): any {
    this.result.push([`#text(${ast.value})`, ast.ngContentIndex]);
    return null;
  }
  visitDirective(ast: DirectiveAst, context: any): any { return null; }
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any { return null; }
}

class ThrowingVisitor implements TemplateAstVisitor {
  visitNgContent(ast: NgContentAst, context: any): any { throw 'not implemented'; }
  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any { throw 'not implemented'; }
  visitElement(ast: ElementAst, context: any): any { throw 'not implemented'; }
  visitReference(ast: ReferenceAst, context: any): any { throw 'not implemented'; }
  visitVariable(ast: VariableAst, context: any): any { throw 'not implemented'; }
  visitEvent(ast: BoundEventAst, context: any): any { throw 'not implemented'; }
  visitElementProperty(ast: BoundElementPropertyAst, context: any): any { throw 'not implemented'; }
  visitAttr(ast: AttrAst, context: any): any { throw 'not implemented'; }
  visitBoundText(ast: BoundTextAst, context: any): any { throw 'not implemented'; }
  visitText(ast: TextAst, context: any): any { throw 'not implemented'; }
  visitDirective(ast: DirectiveAst, context: any): any { throw 'not implemented'; }
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any {
    throw 'not implemented';
  }
}

class FooAstTransformer extends ThrowingVisitor {
  visitElement(ast: ElementAst, context: any): any {
    if (ast.name != 'div') return ast;
    return new ElementAst(
        'foo', [], [], [], [], [], [], false, [], [], ast.ngContentIndex, ast.sourceSpan,
        ast.endSourceSpan);
  }
}

class BarAstTransformer extends FooAstTransformer {
  visitElement(ast: ElementAst, context: any): any {
    if (ast.name != 'foo') return ast;
    return new ElementAst(
        'bar', [], [], [], [], [], [], false, [], [], ast.ngContentIndex, ast.sourceSpan,
        ast.endSourceSpan);
  }
}

class NullVisitor implements TemplateAstVisitor {
  visitNgContent(ast: NgContentAst, context: any): any {}
  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any {}
  visitElement(ast: ElementAst, context: any): any {}
  visitReference(ast: ReferenceAst, context: any): any {}
  visitVariable(ast: VariableAst, context: any): any {}
  visitEvent(ast: BoundEventAst, context: any): any {}
  visitElementProperty(ast: BoundElementPropertyAst, context: any): any {}
  visitAttr(ast: AttrAst, context: any): any {}
  visitBoundText(ast: BoundTextAst, context: any): any {}
  visitText(ast: TextAst, context: any): any {}
  visitDirective(ast: DirectiveAst, context: any): any {}
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any {}
}

class ArrayConsole implements Console {
  logs: string[] = [];
  warnings: string[] = [];
  log(msg: string) { this.logs.push(msg); }
  warn(msg: string) { this.warnings.push(msg); }
}
