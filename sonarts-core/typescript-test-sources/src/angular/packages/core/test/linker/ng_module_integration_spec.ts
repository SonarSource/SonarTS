/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ANALYZE_FOR_ENTRY_COMPONENTS, CUSTOM_ELEMENTS_SCHEMA, Compiler, Component, ComponentFactoryResolver, Directive, HostBinding, Inject, Injectable, InjectionToken, Injector, Input, NgModule, NgModuleRef, Optional, Pipe, Provider, Self, Type, forwardRef, getModuleFactory} from '@angular/core';
import {Console} from '@angular/core/src/console';
import {ComponentFixture, TestBed, inject} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';

import {InternalNgModuleRef} from '../../src/linker/ng_module_factory';
import {clearModulesForTest} from '../../src/linker/ng_module_factory_loader';
import {stringify} from '../../src/util';

class Engine {}

class BrokenEngine {
  constructor() { throw new Error('Broken Engine'); }
}

class DashboardSoftware {}

@Injectable()
class Dashboard {
  constructor(software: DashboardSoftware) {}
}

class TurboEngine extends Engine {}

const CARS = new InjectionToken<Car[]>('Cars');
@Injectable()
class Car {
  engine: Engine;
  constructor(engine: Engine) { this.engine = engine; }
}

@Injectable()
class CarWithOptionalEngine {
  engine: Engine;
  constructor(@Optional() engine: Engine) { this.engine = engine; }
}

@Injectable()
class CarWithDashboard {
  engine: Engine;
  dashboard: Dashboard;
  constructor(engine: Engine, dashboard: Dashboard) {
    this.engine = engine;
    this.dashboard = dashboard;
  }
}

@Injectable()
class SportsCar extends Car {
  engine: Engine;
  constructor(engine: Engine) { super(engine); }
}

@Injectable()
class CarWithInject {
  engine: Engine;
  constructor(@Inject(TurboEngine) engine: Engine) { this.engine = engine; }
}

@Injectable()
class CyclicEngine {
  constructor(car: Car) {}
}

class NoAnnotations {
  constructor(secretDependency: any) {}
}

function factoryFn(a: any) {}

@Component({selector: 'comp', template: ''})
class SomeComp {
}

@Directive({selector: '[someDir]'})
class SomeDirective {
  @HostBinding('title') @Input()
  someDir: string;
}

@Pipe({name: 'somePipe'})
class SomePipe {
  transform(value: string): any { return `transformed ${value}`; }
}

@Component({selector: 'comp', template: `<div  [someDir]="'someValue' | somePipe"></div>`})
class CompUsingModuleDirectiveAndPipe {
}

class DummyConsole implements Console {
  public warnings: string[] = [];

  log(message: string) {}
  warn(message: string) { this.warnings.push(message); }
}

export function main() {
  describe('jit', () => { declareTests({useJit: true}); });

  describe('no jit', () => { declareTests({useJit: false}); });
}

function declareTests({useJit}: {useJit: boolean}) {
  describe('NgModule', () => {
    let compiler: Compiler;
    let injector: Injector;
    let console: DummyConsole;

    beforeEach(() => {
      console = new DummyConsole();
      TestBed.configureCompiler(
          {useJit: useJit, providers: [{provide: Console, useValue: console}]});
    });

    beforeEach(inject([Compiler, Injector], (_compiler: Compiler, _injector: Injector) => {
      compiler = _compiler;
      injector = _injector;
    }));

    function createModule<T>(
        moduleType: Type<T>, parentInjector?: Injector | null): NgModuleRef<T> {
      return compiler.compileModuleSync(moduleType).create(parentInjector || null);
    }

    function createComp<T>(compType: Type<T>, moduleType: Type<any>): ComponentFixture<T> {
      const ngModule = createModule(moduleType, injector);

      const cf = ngModule.componentFactoryResolver.resolveComponentFactory(compType) !;

      const comp = cf.create(Injector.NULL);

      return new ComponentFixture(comp, null !, false);
    }

    describe('errors', () => {
      it('should error when exporting a directive that was neither declared nor imported', () => {
        @NgModule({exports: [SomeDirective]})
        class SomeModule {
        }

        expect(() => createModule(SomeModule))
            .toThrowError(
                `Can't export directive ${stringify(SomeDirective)} from ${stringify(SomeModule)} as it was neither declared nor imported!`);
      });

      it('should error when exporting a pipe that was neither declared nor imported', () => {
        @NgModule({exports: [SomePipe]})
        class SomeModule {
        }

        expect(() => createModule(SomeModule))
            .toThrowError(
                `Can't export pipe ${stringify(SomePipe)} from ${stringify(SomeModule)} as it was neither declared nor imported!`);
      });

      it('should error if a directive is declared in more than 1 module', () => {
        @NgModule({declarations: [SomeDirective]})
        class Module1 {
        }

        @NgModule({declarations: [SomeDirective]})
        class Module2 {
        }

        createModule(Module1);

        expect(() => createModule(Module2))
            .toThrowError(
                `Type ${stringify(SomeDirective)} is part of the declarations of 2 modules: ${stringify(Module1)} and ${stringify(Module2)}! ` +
                `Please consider moving ${stringify(SomeDirective)} to a higher module that imports ${stringify(Module1)} and ${stringify(Module2)}. ` +
                `You can also create a new NgModule that exports and includes ${stringify(SomeDirective)} then import that NgModule in ${stringify(Module1)} and ${stringify(Module2)}.`);
      });

      it('should error if a directive is declared in more than 1 module also if the module declaring it is imported',
         () => {
           @NgModule({declarations: [SomeDirective], exports: [SomeDirective]})
           class Module1 {
           }

           @NgModule({declarations: [SomeDirective], imports: [Module1]})
           class Module2 {
           }

           expect(() => createModule(Module2))
               .toThrowError(
                   `Type ${stringify(SomeDirective)} is part of the declarations of 2 modules: ${stringify(Module1)} and ${stringify(Module2)}! ` +
                   `Please consider moving ${stringify(SomeDirective)} to a higher module that imports ${stringify(Module1)} and ${stringify(Module2)}. ` +
                   `You can also create a new NgModule that exports and includes ${stringify(SomeDirective)} then import that NgModule in ${stringify(Module1)} and ${stringify(Module2)}.`);
         });

      it('should error if a pipe is declared in more than 1 module', () => {
        @NgModule({declarations: [SomePipe]})
        class Module1 {
        }

        @NgModule({declarations: [SomePipe]})
        class Module2 {
        }

        createModule(Module1);

        expect(() => createModule(Module2))
            .toThrowError(
                `Type ${stringify(SomePipe)} is part of the declarations of 2 modules: ${stringify(Module1)} and ${stringify(Module2)}! ` +
                `Please consider moving ${stringify(SomePipe)} to a higher module that imports ${stringify(Module1)} and ${stringify(Module2)}. ` +
                `You can also create a new NgModule that exports and includes ${stringify(SomePipe)} then import that NgModule in ${stringify(Module1)} and ${stringify(Module2)}.`);
      });

      it('should error if a pipe is declared in more than 1 module also if the module declaring it is imported',
         () => {
           @NgModule({declarations: [SomePipe], exports: [SomePipe]})
           class Module1 {
           }

           @NgModule({declarations: [SomePipe], imports: [Module1]})
           class Module2 {
           }

           expect(() => createModule(Module2))
               .toThrowError(
                   `Type ${stringify(SomePipe)} is part of the declarations of 2 modules: ${stringify(Module1)} and ${stringify(Module2)}! ` +
                   `Please consider moving ${stringify(SomePipe)} to a higher module that imports ${stringify(Module1)} and ${stringify(Module2)}. ` +
                   `You can also create a new NgModule that exports and includes ${stringify(SomePipe)} then import that NgModule in ${stringify(Module1)} and ${stringify(Module2)}.`);
         });

    });

    describe('schemas', () => {
      it('should error on unknown bound properties on custom elements by default', () => {
        @Component({template: '<some-element [someUnknownProp]="true"></some-element>'})
        class ComponentUsingInvalidProperty {
        }

        @NgModule({declarations: [ComponentUsingInvalidProperty]})
        class SomeModule {
        }

        expect(() => createModule(SomeModule)).toThrowError(/Can't bind to 'someUnknownProp'/);
      });

      it('should not error on unknown bound properties on custom elements when using the CUSTOM_ELEMENTS_SCHEMA',
         () => {
           @Component({template: '<some-element [someUnknownProp]="true"></some-element>'})
           class ComponentUsingInvalidProperty {
           }

           @NgModule(
               {schemas: [CUSTOM_ELEMENTS_SCHEMA], declarations: [ComponentUsingInvalidProperty]})
           class SomeModule {
           }

           expect(() => createModule(SomeModule)).not.toThrow();
         });
    });

    describe('id', () => {
      const token = 'myid';
      @NgModule({id: token})
      class SomeModule {
      }
      @NgModule({id: token})
      class SomeOtherModule {
      }

      afterEach(() => clearModulesForTest());

      it('should register loaded modules', () => {
        createModule(SomeModule);
        const factory = getModuleFactory(token);
        expect(factory).toBeTruthy();
        expect(factory.moduleType).toBe(SomeModule);
      });

      it('should throw when registering a duplicate module', () => {
        createModule(SomeModule);
        expect(() => createModule(SomeOtherModule)).toThrowError(/Duplicate module registered/);
      });
    });

    describe('entryComponents', () => {
      it('should create ComponentFactories in root modules', () => {
        @NgModule({declarations: [SomeComp], entryComponents: [SomeComp]})
        class SomeModule {
        }

        const ngModule = createModule(SomeModule);
        expect(ngModule.componentFactoryResolver.resolveComponentFactory(SomeComp) !.componentType)
            .toBe(SomeComp);
        expect(ngModule.injector.get(ComponentFactoryResolver)
                   .resolveComponentFactory(SomeComp)
                   .componentType)
            .toBe(SomeComp);
      });

      it('should throw if we cannot find a module associated with a module-level entryComponent', () => {
        @Component({template: ''})
        class SomeCompWithEntryComponents {
        }

        @NgModule({declarations: [], entryComponents: [SomeCompWithEntryComponents]})
        class SomeModule {
        }

        expect(() => createModule(SomeModule))
            .toThrowError(
                'Component SomeCompWithEntryComponents is not part of any NgModule or the module has not been imported into your module.');
      });

      it('should throw if we cannot find a module associated with a component-level entryComponent',
         () => {
           @Component({template: '', entryComponents: [SomeComp]})
           class SomeCompWithEntryComponents {
           }

           @NgModule({declarations: [SomeCompWithEntryComponents]})
           class SomeModule {
           }

           expect(() => createModule(SomeModule))
               .toThrowError(
                   'Component SomeComp is not part of any NgModule or the module has not been imported into your module.');
         });

      it('should create ComponentFactories via ANALYZE_FOR_ENTRY_COMPONENTS', () => {
        @NgModule({
          declarations: [SomeComp],
          providers: [{
            provide: ANALYZE_FOR_ENTRY_COMPONENTS,
            multi: true,
            useValue: [{a: 'b', component: SomeComp}]
          }]
        })
        class SomeModule {
        }

        const ngModule = createModule(SomeModule);
        expect(ngModule.componentFactoryResolver.resolveComponentFactory(SomeComp) !.componentType)
            .toBe(SomeComp);
        expect(ngModule.injector.get(ComponentFactoryResolver)
                   .resolveComponentFactory(SomeComp)
                   .componentType)
            .toBe(SomeComp);
      });

      it('should create ComponentFactories in imported modules', () => {
        @NgModule({declarations: [SomeComp], entryComponents: [SomeComp]})
        class SomeImportedModule {
        }

        @NgModule({imports: [SomeImportedModule]})
        class SomeModule {
        }

        const ngModule = createModule(SomeModule);
        expect(ngModule.componentFactoryResolver.resolveComponentFactory(SomeComp) !.componentType)
            .toBe(SomeComp);
        expect(ngModule.injector.get(ComponentFactoryResolver)
                   .resolveComponentFactory(SomeComp)
                   .componentType)
            .toBe(SomeComp);
      });

      it('should create ComponentFactories if the component was imported', () => {
        @NgModule({declarations: [SomeComp], exports: [SomeComp]})
        class SomeImportedModule {
        }

        @NgModule({imports: [SomeImportedModule], entryComponents: [SomeComp]})
        class SomeModule {
        }

        const ngModule = createModule(SomeModule);
        expect(ngModule.componentFactoryResolver.resolveComponentFactory(SomeComp) !.componentType)
            .toBe(SomeComp);
        expect(ngModule.injector.get(ComponentFactoryResolver)
                   .resolveComponentFactory(SomeComp)
                   .componentType)
            .toBe(SomeComp);
      });

    });

    describe('bootstrap components', () => {
      it('should create ComponentFactories', () => {
        @NgModule({declarations: [SomeComp], bootstrap: [SomeComp]})
        class SomeModule {
        }

        const ngModule = createModule(SomeModule);
        expect(ngModule.componentFactoryResolver.resolveComponentFactory(SomeComp) !.componentType)
            .toBe(SomeComp);
      });

      it('should store the ComponentFactories in the NgModuleInjector', () => {
        @NgModule({declarations: [SomeComp], bootstrap: [SomeComp]})
        class SomeModule {
        }

        const ngModule = <InternalNgModuleRef<any>>createModule(SomeModule);
        expect(ngModule._bootstrapComponents.length).toBe(1);
        expect(ngModule._bootstrapComponents[0]).toBe(SomeComp);
      });

    });

    describe('directives and pipes', () => {
      describe('declarations', () => {
        it('should be supported in root modules', () => {
          @NgModule({
            declarations: [CompUsingModuleDirectiveAndPipe, SomeDirective, SomePipe],
            entryComponents: [CompUsingModuleDirectiveAndPipe]
          })
          class SomeModule {
          }

          const compFixture = createComp(CompUsingModuleDirectiveAndPipe, SomeModule);

          compFixture.detectChanges();
          expect(compFixture.debugElement.children[0].properties['title'])
              .toBe('transformed someValue');
        });

        it('should be supported in imported modules', () => {
          @NgModule({
            declarations: [CompUsingModuleDirectiveAndPipe, SomeDirective, SomePipe],
            entryComponents: [CompUsingModuleDirectiveAndPipe]
          })
          class SomeImportedModule {
          }

          @NgModule({imports: [SomeImportedModule]})
          class SomeModule {
          }

          const compFixture = createComp(CompUsingModuleDirectiveAndPipe, SomeModule);
          compFixture.detectChanges();
          expect(compFixture.debugElement.children[0].properties['title'])
              .toBe('transformed someValue');
        });


        it('should be supported in nested components', () => {
          @Component({
            selector: 'parent',
            template: '<comp></comp>',
          })
          class ParentCompUsingModuleDirectiveAndPipe {
          }

          @NgModule({
            declarations: [
              ParentCompUsingModuleDirectiveAndPipe, CompUsingModuleDirectiveAndPipe, SomeDirective,
              SomePipe
            ],
            entryComponents: [ParentCompUsingModuleDirectiveAndPipe]
          })
          class SomeModule {
          }

          const compFixture = createComp(ParentCompUsingModuleDirectiveAndPipe, SomeModule);
          compFixture.detectChanges();
          expect(compFixture.debugElement.children[0].children[0].properties['title'])
              .toBe('transformed someValue');
        });
      });

      describe('import/export', () => {

        it('should support exported directives and pipes', () => {
          @NgModule({declarations: [SomeDirective, SomePipe], exports: [SomeDirective, SomePipe]})
          class SomeImportedModule {
          }

          @NgModule({
            declarations: [CompUsingModuleDirectiveAndPipe],
            imports: [SomeImportedModule],
            entryComponents: [CompUsingModuleDirectiveAndPipe]
          })
          class SomeModule {
          }


          const compFixture = createComp(CompUsingModuleDirectiveAndPipe, SomeModule);
          compFixture.detectChanges();
          expect(compFixture.debugElement.children[0].properties['title'])
              .toBe('transformed someValue');
        });

        it('should support exported directives and pipes if the module is wrapped into an `ModuleWithProviders`',
           () => {
             @NgModule(
                 {declarations: [SomeDirective, SomePipe], exports: [SomeDirective, SomePipe]})
             class SomeImportedModule {
             }

             @NgModule({
               declarations: [CompUsingModuleDirectiveAndPipe],
               imports: [{ngModule: SomeImportedModule}],
               entryComponents: [CompUsingModuleDirectiveAndPipe]
             })
             class SomeModule {
             }


             const compFixture = createComp(CompUsingModuleDirectiveAndPipe, SomeModule);
             compFixture.detectChanges();
             expect(compFixture.debugElement.children[0].properties['title'])
                 .toBe('transformed someValue');
           });

        it('should support reexported modules', () => {
          @NgModule({declarations: [SomeDirective, SomePipe], exports: [SomeDirective, SomePipe]})
          class SomeReexportedModule {
          }

          @NgModule({exports: [SomeReexportedModule]})
          class SomeImportedModule {
          }

          @NgModule({
            declarations: [CompUsingModuleDirectiveAndPipe],
            imports: [SomeImportedModule],
            entryComponents: [CompUsingModuleDirectiveAndPipe]
          })
          class SomeModule {
          }

          const compFixture = createComp(CompUsingModuleDirectiveAndPipe, SomeModule);
          compFixture.detectChanges();
          expect(compFixture.debugElement.children[0].properties['title'])
              .toBe('transformed someValue');
        });

        it('should support exporting individual directives of an imported module', () => {
          @NgModule({declarations: [SomeDirective, SomePipe], exports: [SomeDirective, SomePipe]})
          class SomeReexportedModule {
          }

          @NgModule({imports: [SomeReexportedModule], exports: [SomeDirective, SomePipe]})
          class SomeImportedModule {
          }

          @NgModule({
            declarations: [CompUsingModuleDirectiveAndPipe],
            imports: [SomeImportedModule],
            entryComponents: [CompUsingModuleDirectiveAndPipe]
          })
          class SomeModule {
          }

          const compFixture = createComp(CompUsingModuleDirectiveAndPipe, SomeModule);
          compFixture.detectChanges();
          expect(compFixture.debugElement.children[0].properties['title'])
              .toBe('transformed someValue');
        });

        it('should not use non exported pipes of an imported module', () => {
          @NgModule({
            declarations: [SomePipe],
          })
          class SomeImportedModule {
          }

          @NgModule({
            declarations: [CompUsingModuleDirectiveAndPipe],
            imports: [SomeImportedModule],
            entryComponents: [CompUsingModuleDirectiveAndPipe]
          })
          class SomeModule {
          }

          expect(() => createComp(SomeComp, SomeModule))
              .toThrowError(/The pipe 'somePipe' could not be found/);
        });

        it('should not use non exported directives of an imported module', () => {
          @NgModule({
            declarations: [SomeDirective],
          })
          class SomeImportedModule {
          }

          @NgModule({
            declarations: [CompUsingModuleDirectiveAndPipe, SomePipe],
            imports: [SomeImportedModule],
            entryComponents: [CompUsingModuleDirectiveAndPipe]
          })
          class SomeModule {
          }

          expect(() => createComp(SomeComp, SomeModule)).toThrowError(/Can't bind to 'someDir'/);
        });
      });
    });


    describe('providers', function() {
      let moduleType: any = null;


      function createInjector(providers: Provider[], parent?: Injector | null): Injector {
        @NgModule({providers: providers})
        class SomeModule {
        }

        moduleType = SomeModule;

        return createModule(SomeModule, parent).injector;
      }

      it('should provide the module',
         () => { expect(createInjector([]).get(moduleType)).toBeAnInstanceOf(moduleType); });

      it('should instantiate a class without dependencies', () => {
        const injector = createInjector([Engine]);
        const engine = injector.get(Engine);

        expect(engine).toBeAnInstanceOf(Engine);
      });

      it('should resolve dependencies based on type information', () => {
        const injector = createInjector([Engine, Car]);
        const car = injector.get(Car);

        expect(car).toBeAnInstanceOf(Car);
        expect(car.engine).toBeAnInstanceOf(Engine);
      });

      it('should resolve dependencies based on @Inject annotation', () => {
        const injector = createInjector([TurboEngine, Engine, CarWithInject]);
        const car = injector.get(CarWithInject);

        expect(car).toBeAnInstanceOf(CarWithInject);
        expect(car.engine).toBeAnInstanceOf(TurboEngine);
      });

      it('should throw when no type and not @Inject (class case)', () => {
        expect(() => createInjector([NoAnnotations]))
            .toThrowError('Can\'t resolve all parameters for NoAnnotations: (?).');
      });

      it('should throw when no type and not @Inject (factory case)', () => {
        expect(() => createInjector([{provide: 'someToken', useFactory: factoryFn}]))
            .toThrowError('Can\'t resolve all parameters for factoryFn: (?).');
      });

      it('should cache instances', () => {
        const injector = createInjector([Engine]);

        const e1 = injector.get(Engine);
        const e2 = injector.get(Engine);

        expect(e1).toBe(e2);
      });

      it('should provide to a value', () => {
        const injector = createInjector([{provide: Engine, useValue: 'fake engine'}]);

        const engine = injector.get(Engine);
        expect(engine).toEqual('fake engine');
      });

      it('should provide to a factory', () => {
        function sportsCarFactory(e: Engine) { return new SportsCar(e); }

        const injector =
            createInjector([Engine, {provide: Car, useFactory: sportsCarFactory, deps: [Engine]}]);

        const car = injector.get(Car);
        expect(car).toBeAnInstanceOf(SportsCar);
        expect(car.engine).toBeAnInstanceOf(Engine);
      });

      it('should supporting provider to null', () => {
        const injector = createInjector([{provide: Engine, useValue: null}]);
        const engine = injector.get(Engine);
        expect(engine).toBeNull();
      });

      it('should provide to an alias', () => {
        const injector = createInjector([
          Engine, {provide: SportsCar, useClass: SportsCar},
          {provide: Car, useExisting: SportsCar}
        ]);

        const car = injector.get(Car);
        const sportsCar = injector.get(SportsCar);
        expect(car).toBeAnInstanceOf(SportsCar);
        expect(car).toBe(sportsCar);
      });

      it('should support multiProviders', () => {
        const injector = createInjector([
          Engine, {provide: CARS, useClass: SportsCar, multi: true},
          {provide: CARS, useClass: CarWithOptionalEngine, multi: true}
        ]);

        const cars = injector.get(CARS);
        expect(cars.length).toEqual(2);
        expect(cars[0]).toBeAnInstanceOf(SportsCar);
        expect(cars[1]).toBeAnInstanceOf(CarWithOptionalEngine);
      });

      it('should support multiProviders that are created using useExisting', () => {
        const injector = createInjector(
            [Engine, SportsCar, {provide: CARS, useExisting: SportsCar, multi: true}]);

        const cars = injector.get(CARS);
        expect(cars.length).toEqual(1);
        expect(cars[0]).toBe(injector.get(SportsCar));
      });

      it('should throw when the aliased provider does not exist', () => {
        const injector = createInjector([{provide: 'car', useExisting: SportsCar}]);
        const e = `No provider for ${stringify(SportsCar)}!`;
        expect(() => injector.get('car')).toThrowError(e);
      });

      it('should handle forwardRef in useExisting', () => {
        const injector = createInjector([
          {provide: 'originalEngine', useClass: forwardRef(() => Engine)},
          {provide: 'aliasedEngine', useExisting: <any>forwardRef(() => 'originalEngine')}
        ]);
        expect(injector.get('aliasedEngine')).toBeAnInstanceOf(Engine);
      });

      it('should support overriding factory dependencies', () => {
        const injector = createInjector(
            [Engine, {provide: Car, useFactory: (e: Engine) => new SportsCar(e), deps: [Engine]}]);

        const car = injector.get(Car);
        expect(car).toBeAnInstanceOf(SportsCar);
        expect(car.engine).toBeAnInstanceOf(Engine);
      });

      it('should support optional dependencies', () => {
        const injector = createInjector([CarWithOptionalEngine]);

        const car = injector.get(CarWithOptionalEngine);
        expect(car.engine).toEqual(null);
      });

      it('should flatten passed-in providers', () => {
        const injector = createInjector([[[Engine, Car]]]);

        const car = injector.get(Car);
        expect(car).toBeAnInstanceOf(Car);
      });

      it('should use the last provider when there are multiple providers for same token', () => {
        const injector = createInjector(
            [{provide: Engine, useClass: Engine}, {provide: Engine, useClass: TurboEngine}]);

        expect(injector.get(Engine)).toBeAnInstanceOf(TurboEngine);
      });

      it('should use non-type tokens', () => {
        const injector = createInjector([{provide: 'token', useValue: 'value'}]);

        expect(injector.get('token')).toEqual('value');
      });

      it('should throw when given invalid providers', () => {
        expect(() => createInjector(<any>['blah']))
            .toThrowError(
                `Invalid provider for the NgModule 'SomeModule' - only instances of Provider and Type are allowed, got: [?blah?]`);
      });

      it('should throw when given blank providers', () => {
        expect(() => createInjector(<any>[null, {provide: 'token', useValue: 'value'}]))
            .toThrowError(
                `Invalid provider for the NgModule 'SomeModule' - only instances of Provider and Type are allowed, got: [?null?, ...]`);
      });

      it('should provide itself', () => {
        const parent = createInjector([]);
        const child = createInjector([], parent);

        expect(child.get(Injector)).toBe(child);
      });

      describe('injecting lazy providers into an eager provider via Injector.get', () => {

        it('should inject providers that were declared before it', () => {
          @NgModule({
            providers: [
              {provide: 'lazy', useFactory: () => 'lazyValue'},
              {
                provide: 'eager',
                useFactory: (i: Injector) => `eagerValue: ${i.get('lazy')}`,
                deps: [Injector]
              },
            ]
          })
          class MyModule {
            // NgModule is eager, which makes all of its deps eager
            constructor(@Inject('eager') eager: any) {}
          }

          expect(createModule(MyModule).injector.get('eager')).toBe('eagerValue: lazyValue');
        });

        it('should inject providers that were declared after it', () => {
          @NgModule({
            providers: [
              {
                provide: 'eager',
                useFactory: (i: Injector) => `eagerValue: ${i.get('lazy')}`,
                deps: [Injector]
              },
              {provide: 'lazy', useFactory: () => 'lazyValue'},
            ]
          })
          class MyModule {
            // NgModule is eager, which makes all of its deps eager
            constructor(@Inject('eager') eager: any) {}
          }

          expect(createModule(MyModule).injector.get('eager')).toBe('eagerValue: lazyValue');
        });
      });

      it('should throw when no provider defined', () => {
        const injector = createInjector([]);
        expect(() => injector.get('NonExisting')).toThrowError('No provider for NonExisting!');
      });

      it('should throw when trying to instantiate a cyclic dependency', () => {
        expect(() => createInjector([Car, {provide: Engine, useClass: CyclicEngine}]))
            .toThrowError(/Cannot instantiate cyclic dependency! Car/g);
      });

      it('should support null values', () => {
        const injector = createInjector([{provide: 'null', useValue: null}]);
        expect(injector.get('null')).toBe(null);
      });


      describe('child', () => {
        it('should load instances from parent injector', () => {
          const parent = createInjector([Engine]);
          const child = createInjector([], parent);

          const engineFromParent = parent.get(Engine);
          const engineFromChild = child.get(Engine);

          expect(engineFromChild).toBe(engineFromParent);
        });

        it('should not use the child providers when resolving the dependencies of a parent provider',
           () => {
             const parent = createInjector([Car, Engine]);
             const child = createInjector([{provide: Engine, useClass: TurboEngine}], parent);

             const carFromChild = child.get(Car);
             expect(carFromChild.engine).toBeAnInstanceOf(Engine);
           });

        it('should create new instance in a child injector', () => {
          const parent = createInjector([Engine]);
          const child = createInjector([{provide: Engine, useClass: TurboEngine}], parent);

          const engineFromParent = parent.get(Engine);
          const engineFromChild = child.get(Engine);

          expect(engineFromParent).not.toBe(engineFromChild);
          expect(engineFromChild).toBeAnInstanceOf(TurboEngine);
        });

      });

      describe('depedency resolution', () => {
        describe('@Self()', () => {
          it('should return a dependency from self', () => {
            const inj = createInjector([
              Engine,
              {provide: Car, useFactory: (e: Engine) => new Car(e), deps: [[Engine, new Self()]]}
            ]);

            expect(inj.get(Car)).toBeAnInstanceOf(Car);
          });

          it('should throw when not requested provider on self', () => {
            expect(() => createInjector([{
                     provide: Car,
                     useFactory: (e: Engine) => new Car(e),
                     deps: [[Engine, new Self()]]
                   }]))
                .toThrowError(/No provider for Engine/g);
          });
        });

        describe('default', () => {
          it('should not skip self', () => {
            const parent = createInjector([Engine]);
            const child = createInjector(
                [
                  {provide: Engine, useClass: TurboEngine},
                  {provide: Car, useFactory: (e: Engine) => new Car(e), deps: [Engine]}
                ],
                parent);

            expect(child.get(Car).engine).toBeAnInstanceOf(TurboEngine);
          });
        });
      });

      describe('lifecycle', () => {
        it('should instantiate modules eagerly', () => {
          let created = false;

          @NgModule()
          class ImportedModule {
            constructor() { created = true; }
          }

          @NgModule({imports: [ImportedModule]})
          class SomeModule {
          }

          createModule(SomeModule);

          expect(created).toBe(true);
        });

        it('should instantiate providers that are not used by a module lazily', () => {
          let created = false;

          createInjector([{
            provide: 'someToken',
            useFactory: () => {
              created = true;
              return true;
            }
          }]);

          expect(created).toBe(false);
        });

        it('should support ngOnDestroy on any provider', () => {
          let destroyed = false;

          class SomeInjectable {
            ngOnDestroy() { destroyed = true; }
          }

          @NgModule({providers: [SomeInjectable]})
          class SomeModule {
            // Inject SomeInjectable to make it eager...
            constructor(i: SomeInjectable) {}
          }

          const moduleRef = createModule(SomeModule);
          expect(destroyed).toBe(false);
          moduleRef.destroy();
          expect(destroyed).toBe(true);
        });

        it('should support ngOnDestroy for lazy providers', () => {
          let created = false;
          let destroyed = false;

          class SomeInjectable {
            constructor() { created = true; }
            ngOnDestroy() { destroyed = true; }
          }

          @NgModule({providers: [SomeInjectable]})
          class SomeModule {
          }

          let moduleRef = createModule(SomeModule);
          expect(created).toBe(false);
          expect(destroyed).toBe(false);

          // no error if the provider was not yet created
          moduleRef.destroy();
          expect(created).toBe(false);
          expect(destroyed).toBe(false);

          moduleRef = createModule(SomeModule);
          moduleRef.injector.get(SomeInjectable);
          expect(created).toBe(true);
          moduleRef.destroy();
          expect(destroyed).toBe(true);
        });
      });

      describe('imported and exported modules', () => {
        it('should add the providers of imported modules', () => {
          @NgModule({providers: [{provide: 'token1', useValue: 'imported'}]})
          class ImportedModule {
          }

          @NgModule({imports: [ImportedModule]})
          class SomeModule {
          }

          const injector = createModule(SomeModule).injector;

          expect(injector.get(SomeModule)).toBeAnInstanceOf(SomeModule);
          expect(injector.get(ImportedModule)).toBeAnInstanceOf(ImportedModule);
          expect(injector.get('token1')).toBe('imported');
        });

        it('should add the providers of imported ModuleWithProviders', () => {
          @NgModule()
          class ImportedModule {
          }

          @NgModule({
            imports: [
              {ngModule: ImportedModule, providers: [{provide: 'token1', useValue: 'imported'}]}
            ]
          })
          class SomeModule {
          }

          const injector = createModule(SomeModule).injector;

          expect(injector.get(SomeModule)).toBeAnInstanceOf(SomeModule);
          expect(injector.get(ImportedModule)).toBeAnInstanceOf(ImportedModule);
          expect(injector.get('token1')).toBe('imported');
        });

        it('should overwrite the providers of imported modules', () => {
          @NgModule({providers: [{provide: 'token1', useValue: 'imported'}]})
          class ImportedModule {
          }

          @NgModule(
              {providers: [{provide: 'token1', useValue: 'direct'}], imports: [ImportedModule]})
          class SomeModule {
          }

          const injector = createModule(SomeModule).injector;
          expect(injector.get('token1')).toBe('direct');
        });

        it('should overwrite the providers of imported ModuleWithProviders', () => {
          @NgModule()
          class ImportedModule {
          }

          @NgModule({
            providers: [{provide: 'token1', useValue: 'direct'}],
            imports: [
              {ngModule: ImportedModule, providers: [{provide: 'token1', useValue: 'imported'}]}
            ]
          })
          class SomeModule {
          }

          const injector = createModule(SomeModule).injector;
          expect(injector.get('token1')).toBe('direct');
        });

        it('should overwrite the providers of imported modules on the second import level', () => {
          @NgModule({providers: [{provide: 'token1', useValue: 'imported'}]})
          class ImportedModuleLevel2 {
          }

          @NgModule({
            providers: [{provide: 'token1', useValue: 'direct'}],
            imports: [ImportedModuleLevel2]
          })
          class ImportedModuleLevel1 {
          }

          @NgModule({imports: [ImportedModuleLevel1]})
          class SomeModule {
          }

          const injector = createModule(SomeModule).injector;
          expect(injector.get('token1')).toBe('direct');
        });

        it('should add the providers of exported modules', () => {
          @NgModule({providers: [{provide: 'token1', useValue: 'exported'}]})
          class ExportedValue {
          }

          @NgModule({exports: [ExportedValue]})
          class SomeModule {
          }

          const injector = createModule(SomeModule).injector;

          expect(injector.get(SomeModule)).toBeAnInstanceOf(SomeModule);
          expect(injector.get(ExportedValue)).toBeAnInstanceOf(ExportedValue);
          expect(injector.get('token1')).toBe('exported');
        });

        it('should overwrite the providers of exported modules', () => {
          @NgModule({providers: [{provide: 'token1', useValue: 'exported'}]})
          class ExportedModule {
          }

          @NgModule(
              {providers: [{provide: 'token1', useValue: 'direct'}], exports: [ExportedModule]})
          class SomeModule {
          }

          const injector = createModule(SomeModule).injector;
          expect(injector.get('token1')).toBe('direct');
        });

        it('should overwrite the providers of imported modules by following imported modules',
           () => {
             @NgModule({providers: [{provide: 'token1', useValue: 'imported1'}]})
             class ImportedModule1 {
             }

             @NgModule({providers: [{provide: 'token1', useValue: 'imported2'}]})
             class ImportedModule2 {
             }

             @NgModule({imports: [ImportedModule1, ImportedModule2]})
             class SomeModule {
             }

             const injector = createModule(SomeModule).injector;
             expect(injector.get('token1')).toBe('imported2');
           });

        it('should overwrite the providers of exported modules by following exported modules',
           () => {
             @NgModule({providers: [{provide: 'token1', useValue: 'exported1'}]})
             class ExportedModule1 {
             }

             @NgModule({providers: [{provide: 'token1', useValue: 'exported2'}]})
             class ExportedModule2 {
             }

             @NgModule({exports: [ExportedModule1, ExportedModule2]})
             class SomeModule {
             }

             const injector = createModule(SomeModule).injector;
             expect(injector.get('token1')).toBe('exported2');
           });

        it('should overwrite the providers of imported modules by exported modules', () => {
          @NgModule({providers: [{provide: 'token1', useValue: 'imported'}]})
          class ImportedModule {
          }

          @NgModule({providers: [{provide: 'token1', useValue: 'exported'}]})
          class ExportedModule {
          }

          @NgModule({imports: [ImportedModule], exports: [ExportedModule]})
          class SomeModule {
          }

          const injector = createModule(SomeModule).injector;
          expect(injector.get('token1')).toBe('exported');
        });

        it('should not overwrite the providers if a module was already used on the same level',
           () => {
             @NgModule({providers: [{provide: 'token1', useValue: 'imported1'}]})
             class ImportedModule1 {
             }

             @NgModule({providers: [{provide: 'token1', useValue: 'imported2'}]})
             class ImportedModule2 {
             }

             @NgModule({imports: [ImportedModule1, ImportedModule2, ImportedModule1]})
             class SomeModule {
             }

             const injector = createModule(SomeModule).injector;
             expect(injector.get('token1')).toBe('imported2');
           });

        it('should not overwrite the providers if a module was already used on a child level',
           () => {
             @NgModule({providers: [{provide: 'token1', useValue: 'imported1'}]})
             class ImportedModule1 {
             }

             @NgModule({imports: [ImportedModule1]})
             class ImportedModule3 {
             }

             @NgModule({providers: [{provide: 'token1', useValue: 'imported2'}]})
             class ImportedModule2 {
             }

             @NgModule({imports: [ImportedModule3, ImportedModule2, ImportedModule1]})
             class SomeModule {
             }

             const injector = createModule(SomeModule).injector;
             expect(injector.get('token1')).toBe('imported2');
           });

        it('should throw when given invalid providers in an imported ModuleWithProviders', () => {
          @NgModule()
          class ImportedModule1 {
          }

          @NgModule({imports: [{ngModule: ImportedModule1, providers: [<any>'broken']}]})
          class SomeModule {
          }

          expect(() => createModule(SomeModule).injector)
              .toThrowError(
                  `Invalid provider for the NgModule 'ImportedModule1' - only instances of Provider and Type are allowed, got: [?broken?]`);
        });
      });
    });
  });
}
