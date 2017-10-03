import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

/** @test {concat} */
describe('Observable.prototype.concat', () => {
  asDiagram('concat')('should concatenate two cold observables', () => {
    const e1 =   cold('--a--b-|');
    const e2 =   cold(       '--x---y--|');
    const expected =  '--a--b---x---y--|';

    expectObservable(e1.concat(e2, rxTestScheduler)).toBe(expected);
  });

  it('should work properly with scalar observables', (done: MochaDone) => {
    const results = [];

    const s1 = Observable
      .create((observer: Rx.Observer<number>) => {
        setTimeout(() => {
          observer.next(1);
          observer.complete();
        });
      })
      .concat(Observable.of(2));

    s1.subscribe((x: number) => {
          results.push('Next: ' + x);
        }, (x) => {
          done(new Error('should not be called'));
        }, () => {
          results.push('Completed');
          expect(results).to.deep.equal(['Next: 1', 'Next: 2', 'Completed']);
          done();
        }
      );
  });

  it('should complete without emit if both sources are empty', () => {
    const e1 =   cold('--|');
    const e1subs =    '^ !';
    const e2 =   cold(  '----|');
    const e2subs =    '  ^   !';
    const expected =  '------|';

    expectObservable(e1.concat(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not complete if first source does not completes', () => {
    const e1 =   cold('-');
    const e1subs =    '^';
    const e2 =   cold('--|');
    const e2subs = [];
    const expected =  '-';

    expectObservable(e1.concat(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not complete if second source does not completes', () => {
    const e1 =   cold('--|');
    const e1subs =    '^ !';
    const e2 =   cold('---');
    const e2subs =    '  ^';
    const expected =  '---';

    expectObservable(e1.concat(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not complete if both sources do not complete', () => {
    const e1 =   cold('-');
    const e1subs =    '^';
    const e2 =   cold('-');
    const e2subs = [];
    const expected =  '-';

    expectObservable(e1.concat(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error when first source is empty, second source raises error', () => {
    const e1 =   cold('--|');
    const e1subs =    '^ !';
    const e2 =   cold(  '----#');
    const e2subs =    '  ^   !';
    const expected =  '------#';

    expectObservable(e1.concat(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error when first source raises error, second source is empty', () => {
    const e1 =   cold('---#');
    const e1subs =    '^  !';
    const e2 =   cold('----|');
    const e2subs = [];
    const expected =  '---#';

    expectObservable(e1.concat(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise first error when both source raise error', () => {
    const e1 =   cold('---#');
    const e1subs =    '^  !';
    const e2 =   cold('------#');
    const e2subs = [];
    const expected =  '---#';

    expectObservable(e1.concat(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should concat if first source emits once, second source is empty', () => {
    const e1 =   cold('--a--|');
    const e1subs =    '^    !';
    const e2 =   cold(     '--------|');
    const e2subs =    '     ^       !';
    const expected =  '--a----------|';

    expectObservable(e1.concat(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should concat if first source is empty, second source emits once', () => {
    const e1 =   cold('--|');
    const e1subs =    '^ !';
    const e2 =   cold(  '--a--|');
    const e2subs =    '  ^    !';
    const expected =  '----a--|';

    expectObservable(e1.concat(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should emit element from first source, and should not complete if second ' +
  'source does not completes', () => {
    const e1 =   cold('--a--|');
    const e1subs =    '^    !';
    const e2 =   cold(     '-');
    const e2subs =    '     ^';
    const expected =  '--a---';

    expectObservable(e1.concat(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not complete if first source does not complete', () => {
    const e1 =   cold('-');
    const e1subs =    '^';
    const e2 =   cold('--a--|');
    const e2subs = [];
    const expected =  '-';

    expectObservable(e1.concat(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should emit elements from each source when source emit once', () => {
    const e1 =   cold('---a|');
    const e1subs =    '^   !';
    const e2 =   cold(    '-----b--|');
    const e2subs =    '    ^       !';
    const expected =  '---a-----b--|';

    expectObservable(e1.concat(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should unsubscribe to inner source if outer is unsubscribed early', () => {
    const e1 =   cold('---a-a--a|            ');
    const e1subs =    '^        !            ';
    const e2 =   cold(         '-----b-b--b-|');
    const e2subs =    '         ^       !    ';
    const unsub =     '                 !    ';
    const expected =  '---a-a--a-----b-b     ';

    expectObservable(e1.concat(e2), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =   cold('---a-a--a|            ');
    const e1subs =    '^        !            ';
    const e2 =   cold(         '-----b-b--b-|');
    const e2subs =    '         ^       !    ';
    const expected =  '---a-a--a-----b-b-    ';
    const unsub =     '                 !    ';

    const result = e1
      .mergeMap((x: any) => Observable.of(x))
      .concat(e2)
      .mergeMap((x: any) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error from first source and does not emit from second source', () => {
    const e1 =   cold('--#');
    const e1subs =    '^ !';
    const e2 =   cold('----a--|');
    const e2subs = [];
    const expected =  '--#';

    expectObservable(e1.concat(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should emit element from first source then raise error from second source', () => {
    const e1 =   cold('--a--|');
    const e1subs =    '^    !';
    const e2 =   cold(     '-------#');
    const e2subs =    '     ^      !';
    const expected =  '--a---------#';

    expectObservable(e1.concat(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should emit all elements from both hot observable sources if first source ' +
  'completes before second source starts emit', () => {
    const e1 =   hot('--a--b-|');
    const e1subs =   '^      !';
    const e2 =   hot('--------x--y--|');
    const e2subs =   '       ^      !';
    const expected = '--a--b--x--y--|';

    expectObservable(e1.concat(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should emit elements from second source regardless of completion time ' +
  'when second source is cold observable', () => {
    const e1 =   hot('--a--b--c---|');
    const e1subs =   '^           !';
    const e2 =  cold('-x-y-z-|');
    const e2subs =   '            ^      !';
    const expected = '--a--b--c----x-y-z-|';

    expectObservable(e1.concat(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not emit collapsing element from second source', () => {
    const e1 =   hot('--a--b--c--|');
    const e1subs =   '^          !';
    const e2 =   hot('--------x--y--z--|');
    const e2subs =   '           ^     !';
    const expected = '--a--b--c--y--z--|';

    expectObservable(e1.concat(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should accept scheduler with multiple observables', () => {
    const e1 =   cold('---a|');
    const e1subs =    '^   !';
    const e2 =   cold(    '---b--|');
    const e2subs =    '    ^     !';
    const e3 =   cold(          '---c--|');
    const e3subs =    '          ^     !';
    const expected =  '---a---b-----c--|';

    expectObservable(e1.concat(e2, e3, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should accept scheduler without observable parameters', () => {
    const e1 =   cold('---a-|');
    const e1subs =    '^    !';
    const expected =  '---a-|';

    expectObservable(e1.concat(rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit self without parameters', () => {
    const e1 =   cold('---a-|');
    const e1subs =    '^    !';
    const expected =  '---a-|';

    expectObservable(e1.concat()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
