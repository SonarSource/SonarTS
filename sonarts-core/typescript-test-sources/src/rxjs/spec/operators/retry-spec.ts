import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;

/** @test {retry} */
describe('Observable.prototype.retry', () => {
  asDiagram('retry(2)')('should handle a basic source that emits next then errors, count=3', () => {
    const source = cold('--1-2-3-#');
    const subs =       ['^       !                ',
                      '        ^       !        ',
                      '                ^       !'];
    const expected =    '--1-2-3---1-2-3---1-2-3-#';

    const result = source.retry(2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should retry a number of times, without error, then complete', (done: MochaDone) => {
    let errors = 0;
    const retries = 2;
    Observable.create((observer: Rx.Observer<number>) => {
      observer.next(42);
      observer.complete();
    })
      .map((x: any) => {
        if (++errors < retries) {
          throw 'bad';
        }
        errors = 0;
        return x;
      })
      .retry(retries)
      .subscribe(
        (x: number) => {
          expect(x).to.equal(42);
        },
        (err: any) => {
          expect('this was called').to.be.true;
        }, done);
  });

  it('should retry a number of times, then call error handler', (done: MochaDone) => {
    let errors = 0;
    const retries = 2;
    Observable.create((observer: Rx.Observer<number>) => {
      observer.next(42);
      observer.complete();
    })
      .map((x: any) => {
        errors += 1;
        throw 'bad';
      })
      .retry(retries - 1)
      .subscribe(
        (x: number) => {
          expect(x).to.equal(42);
        },
        (err: any) => {
          expect(errors).to.equal(2);
          done();
        }, () => {
          expect('this was called').to.be.true;
        });
  });

  it('should retry until successful completion', (done: MochaDone) => {
    let errors = 0;
    const retries = 10;
    Observable.create((observer: Rx.Observer<number>) => {
      observer.next(42);
      observer.complete();
    })
      .map((x: any) => {
        if (++errors < retries) {
          throw 'bad';
        }
        errors = 0;
        return x;
      })
      .retry()
      .take(retries)
      .subscribe(
        (x: number) => {
          expect(x).to.equal(42);
        },
        (err: any) => {
          expect('this was called').to.be.true;
        }, done);
  });

  it('should handle an empty source', () => {
    const source = cold('|');
    const subs =        '(^!)';
    const expected =    '|';

    const result = source.retry();

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should handle a never source', () => {
    const source = cold('-');
    const subs =        '^';
    const expected =    '-';

    const result = source.retry();

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return a never observable given an async just-throw source and no count', () => {
    const source = cold('-#'); // important that it's not a sync error
    const unsub =       '                                     !';
    const expected =    '--------------------------------------';

    const result = source.retry();

    expectObservable(result, unsub).toBe(expected);
  });

  it('should handle a basic source that emits next then completes', () => {
    const source = hot('--1--2--^--3--4--5---|');
    const subs =               '^            !';
    const expected =           '---3--4--5---|';

    const result = source.retry();

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should handle a basic source that emits next but does not complete', () => {
    const source = hot('--1--2--^--3--4--5---');
    const subs =               '^            ';
    const expected =           '---3--4--5---';

    const result = source.retry();

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should handle a basic source that emits next then errors, no count', () => {
    const source = cold('--1-2-3-#');
    const unsub =       '                                     !';
    const subs =       ['^       !                             ',
                      '        ^       !                     ',
                      '                ^       !             ',
                      '                        ^       !     ',
                      '                                ^    !'];
    const expected =    '--1-2-3---1-2-3---1-2-3---1-2-3---1-2-';

    const result = source.retry();

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should handle a source which eventually throws, count=3, and result is ' +
  'unsubscribed early', () => {
    const source = cold('--1-2-3-#');
    const unsub =       '             !           ';
    const subs =       ['^       !                ',
                      '        ^    !           '];
    const expected =    '--1-2-3---1-2-';

    const result = source.retry(3);

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    const source = cold('--1-2-3-#');
    const subs =       ['^       !                ',
                      '        ^    !           '];
    const expected =    '--1-2-3---1-2-';
    const unsub =       '             !           ';

    const result = source
      .mergeMap((x: string) => Observable.of(x))
      .retry(100)
      .mergeMap((x: string) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should retry a synchronous source (multicasted and refCounted) multiple times', (done: MochaDone) => {
    const expected = [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3];

    Observable.of(1, 2, 3).concat(Observable.throw('bad!'))
      .multicast(() => new Rx.Subject())
      .refCount()
      .retry(4)
      .subscribe(
        (x: number) => { expect(x).to.equal(expected.shift()); },
        (err: any) => {
          expect(err).to.equal('bad!');
          expect(expected.length).to.equal(0);
          done();
        }, () => {
          done(new Error('should not be called'));
        });
  });
});