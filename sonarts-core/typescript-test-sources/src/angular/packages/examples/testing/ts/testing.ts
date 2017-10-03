/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


let db: any;
class MyService {}
class MyMockService implements MyService {}

// #docregion describeIt
describe('some component', () => {
  it('does something', () => {
                           // This is a test.
                       });
});
// #enddocregion

// #docregion fdescribe
/* tslint:disable-next-line:no-jasmine-focus */
fdescribe('some component', () => {
  it('has a test', () => {
                       // This test will run.
                   });
});
describe('another component', () => {
  it('also has a test', () => { throw 'This test will not run.'; });
});
// #enddocregion

// #docregion xdescribe
xdescribe(
    'some component', () => { it('has a test', () => { throw 'This test will not run.'; }); });
describe('another component', () => {
  it('also has a test', () => {
                            // This test will run.
                        });
});
// #enddocregion

// #docregion fit
describe('some component', () => {
  /* tslint:disable-next-line:no-jasmine-focus */
  fit('has a test', () => {
                        // This test will run.
                    });
  it('has another test', () => { throw 'This test will not run.'; });
});
// #enddocregion

// #docregion xit
describe('some component', () => {
  xit('has a test', () => { throw 'This test will not run.'; });
  it('has another test', () => {
                             // This test will run.
                         });
});
// #enddocregion

// #docregion beforeEach
describe('some component', () => {
  beforeEach(() => { db.connect(); });
  it('uses the db', () => {
                        // Database is connected.
                    });
});
// #enddocregion

// #docregion afterEach
describe('some component', () => {
  afterEach((done: Function) => { db.reset().then((_: any) => done()); });
  it('uses the db', () => {
                        // This test can leave the database in a dirty state.
                        // The afterEach will ensure it gets reset.
                    });
});
// #enddocregion
