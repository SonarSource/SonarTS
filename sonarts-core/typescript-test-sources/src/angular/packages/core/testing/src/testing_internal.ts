/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵisPromise as isPromise} from '@angular/core';
import {global} from '@angular/core/src/util';

import {AsyncTestCompleter} from './async_test_completer';
import {getTestBed, inject} from './test_bed';

export {AsyncTestCompleter} from './async_test_completer';
export {inject} from './test_bed';

export * from './logger';
export * from './ng_zone_mock';

export const proxy: ClassDecorator = (t: any) => t;

const _global = <any>(typeof window === 'undefined' ? global : window);

export const afterEach: Function = _global.afterEach;
export const expect: (actual: any) => jasmine.Matchers = _global.expect;

const jsmBeforeEach = _global.beforeEach;
const jsmDescribe = _global.describe;
const jsmDDescribe = _global.fdescribe;
const jsmXDescribe = _global.xdescribe;
const jsmIt = _global.it;
const jsmIIt = _global.fit;
const jsmXIt = _global.xit;

const runnerStack: BeforeEachRunner[] = [];
jasmine.DEFAULT_TIMEOUT_INTERVAL = 3000;
const globalTimeOut = jasmine.DEFAULT_TIMEOUT_INTERVAL;

const testBed = getTestBed();

/**
 * Mechanism to run `beforeEach()` functions of Angular tests.
 *
 * Note: Jasmine own `beforeEach` is used by this library to handle DI providers.
 */
class BeforeEachRunner {
  private _fns: Array<Function> = [];

  constructor(private _parent: BeforeEachRunner) {}

  beforeEach(fn: Function): void { this._fns.push(fn); }

  run(): void {
    if (this._parent) this._parent.run();
    this._fns.forEach((fn) => { fn(); });
  }
}

// Reset the test providers before each test
jsmBeforeEach(() => { testBed.resetTestingModule(); });

function _describe(jsmFn: Function, ...args: any[]) {
  const parentRunner = runnerStack.length === 0 ? null : runnerStack[runnerStack.length - 1];
  const runner = new BeforeEachRunner(parentRunner !);
  runnerStack.push(runner);
  const suite = jsmFn(...args);
  runnerStack.pop();
  return suite;
}

export function describe(...args: any[]): void {
  return _describe(jsmDescribe, ...args);
}

export function ddescribe(...args: any[]): void {
  return _describe(jsmDDescribe, ...args);
}

export function xdescribe(...args: any[]): void {
  return _describe(jsmXDescribe, ...args);
}

export function beforeEach(fn: Function): void {
  if (runnerStack.length > 0) {
    // Inside a describe block, beforeEach() uses a BeforeEachRunner
    runnerStack[runnerStack.length - 1].beforeEach(fn);
  } else {
    // Top level beforeEach() are delegated to jasmine
    jsmBeforeEach(fn);
  }
}

/**
 * Allows overriding default providers defined in test_injector.js.
 *
 * The given function must return a list of DI providers.
 *
 * Example:
 *
 *   beforeEachProviders(() => [
 *     {provide: Compiler, useClass: MockCompiler},
 *     {provide: SomeToken, useValue: myValue},
 *   ]);
 */
export function beforeEachProviders(fn: Function): void {
  jsmBeforeEach(() => {
    const providers = fn();
    if (!providers) return;
    testBed.configureTestingModule({providers: providers});
  });
}


function _it(jsmFn: Function, name: string, testFn: Function, testTimeOut: number): void {
  if (runnerStack.length == 0) {
    // This left here intentionally, as we should never get here, and it aids debugging.
    debugger;
    throw new Error('Empty Stack!');
  }
  const runner = runnerStack[runnerStack.length - 1];
  const timeOut = Math.max(globalTimeOut, testTimeOut);

  jsmFn(name, (done: any) => {
    const completerProvider = {
      provide: AsyncTestCompleter,
      useFactory: () => {
        // Mark the test as async when an AsyncTestCompleter is injected in an it()
        return new AsyncTestCompleter();
      }
    };
    testBed.configureTestingModule({providers: [completerProvider]});
    runner.run();

    if (testFn.length == 0) {
      const retVal = testFn();
      if (isPromise(retVal)) {
        // Asynchronous test function that returns a Promise - wait for completion.
        (<Promise<any>>retVal).then(done, done.fail);
      } else {
        // Synchronous test function - complete immediately.
        done();
      }
    } else {
      // Asynchronous test function that takes in 'done' parameter.
      testFn(done);
    }
  }, timeOut);
}

export function it(name: any, fn: any, timeOut: any = null): void {
  return _it(jsmIt, name, fn, timeOut);
}

export function xit(name: any, fn: any, timeOut: any = null): void {
  return _it(jsmXIt, name, fn, timeOut);
}

export function iit(name: any, fn: any, timeOut: any = null): void {
  return _it(jsmIIt, name, fn, timeOut);
}

export class SpyObject {
  constructor(type?: any) {
    if (type) {
      for (const prop in type.prototype) {
        let m: any = null;
        try {
          m = type.prototype[prop];
        } catch (e) {
          // As we are creating spys for abstract classes,
          // these classes might have getters that throw when they are accessed.
          // As we are only auto creating spys for methods, this
          // should not matter.
        }
        if (typeof m === 'function') {
          this.spy(prop);
        }
      }
    }
  }

  spy(name: string) {
    if (!(this as any)[name]) {
      (this as any)[name] = jasmine.createSpy(name);
    }
    return (this as any)[name];
  }

  prop(name: string, value: any) { (this as any)[name] = value; }

  static stub(object: any = null, config: any = null, overrides: any = null) {
    if (!(object instanceof SpyObject)) {
      overrides = config;
      config = object;
      object = new SpyObject();
    }

    const m = {...config, ...overrides};
    Object.keys(m).forEach(key => { object.spy(key).and.returnValue(m[key]); });
    return object;
  }
}
