import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram, type };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;

/** @test {scan} */
describe('Observable.prototype.scan', () => {
  asDiagram('scan((acc, curr) => acc + curr, 0)')('should scan', () => {
    const values = {
      a: 1, b: 3, c: 5,
      x: 1, y: 4, z: 9
    };
    const e1 =     hot('--a--b--c--|', values);
    const e1subs =     '^          !';
    const expected =   '--x--y--z--|';

    const scanFunction = function (o, x) {
      return o + x;
    };

    expectObservable(e1.scan(scanFunction, 0)).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should scan things', () => {
    const e1 = hot('--a--^--b--c--d--e--f--g--|');
    const e1subs =      '^                    !';
    const expected =    '---u--v--w--x--y--z--|';

    const values = {
      u: ['b'],
      v: ['b', 'c'],
      w: ['b', 'c', 'd'],
      x: ['b', 'c', 'd', 'e'],
      y: ['b', 'c', 'd', 'e', 'f'],
      z: ['b', 'c', 'd', 'e', 'f', 'g']
    };

    const source = e1.scan((acc: any, x: string) => [].concat(acc, x), []);

    expectObservable(source).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should scan with a seed of undefined', () => {
    const e1 = hot('--a--^--b--c--d--e--f--g--|');
    const e1subs =      '^                    !';
    const expected =    '---u--v--w--x--y--z--|';

    const values = {
      u: 'undefined b',
      v: 'undefined b c',
      w: 'undefined b c d',
      x: 'undefined b c d e',
      y: 'undefined b c d e f',
      z: 'undefined b c d e f g'
    };

    const source = e1.scan((acc: any, x: string) => acc + ' ' + x, undefined);

    expectObservable(source).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should scan without seed', () => {
    const e1 = hot('--a--^--b--c--d--|');
    const e1subs =      '^           !';
    const expected =    '---x--y--z--|';

    const values = {
      x: 'b',
      y: 'bc',
      z: 'bcd'
    };

    const source = e1.scan((acc: any, x: string) => acc + x);

    expectObservable(source).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle errors', () => {
    const e1 = hot('--a--^--b--c--d--#');
    const e1subs =      '^           !';
    const expected =    '---u--v--w--#';

    const values = {
      u: ['b'],
      v: ['b', 'c'],
      w: ['b', 'c', 'd']
    };

    const source = e1.scan((acc: any, x: string) => [].concat(acc, x), []);

    expectObservable(source).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle errors in the projection function', () => {
    const e1 = hot('--a--^--b--c--d--e--f--g--|');
    const e1subs =      '^        !            ';
    const expected =    '---u--v--#            ';

    const values = {
      u: ['b'],
      v: ['b', 'c'],
      w: ['b', 'c', 'd'],
      x: ['b', 'c', 'd', 'e'],
      y: ['b', 'c', 'd', 'e', 'f'],
      z: ['b', 'c', 'd', 'e', 'f', 'g']
    };

    const source = e1.scan((acc: any, x: string) => {
      if (x === 'd') {
        throw 'bad!';
      }
      return [].concat(acc, x);
    }, []);

    expectObservable(source).toBe(expected, values, 'bad!');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('handle empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '|';

    const source = e1.scan((acc: any, x: string) => [].concat(acc, x), []);

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('handle never', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    const source = e1.scan((acc: any, x: string) => [].concat(acc, x), []);

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('handle throw', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    const source = e1.scan((acc: any, x: string) => [].concat(acc, x), []);

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 = hot('--a--^--b--c--d--e--f--g--|');
    const unsub =       '              !       ';
    const e1subs =      '^             !       ';
    const expected =    '---u--v--w--x--       ';
    const values = {
      u: ['b'],
      v: ['b', 'c'],
      w: ['b', 'c', 'd'],
      x: ['b', 'c', 'd', 'e'],
      y: ['b', 'c', 'd', 'e', 'f'],
      z: ['b', 'c', 'd', 'e', 'f', 'g']
    };

    const source = e1.scan((acc: any, x: string) => [].concat(acc, x), []);

    expectObservable(source, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 = hot('--a--^--b--c--d--e--f--g--|');
    const e1subs =      '^             !       ';
    const expected =    '---u--v--w--x--       ';
    const unsub =       '              !       ';
    const values = {
      u: ['b'],
      v: ['b', 'c'],
      w: ['b', 'c', 'd'],
      x: ['b', 'c', 'd', 'e'],
      y: ['b', 'c', 'd', 'e', 'f'],
      z: ['b', 'c', 'd', 'e', 'f', 'g']
    };

    const source = e1
      .mergeMap((x: string) => Observable.of(x))
      .scan((acc: any, x: string) => [].concat(acc, x), [])
      .mergeMap((x: string) => Observable.of(x));

    expectObservable(source, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should pass current index to accumulator', () => {
    const values = {
      a: 1, b: 3, c: 5,
      x: 1, y: 4, z: 9
    };
    let idx = [0, 1, 2];

    const e1 =     hot('--a--b--c--|', values);
    const e1subs =     '^          !';
    const expected =   '--x--y--z--|';

    const scanFunction = (o: number, value: number, index: number) => {
      expect(index).to.equal(idx.shift());
      return o + value;
    };

    const scan = e1.scan(scanFunction, 0).finally(() => {
      expect(idx).to.be.empty;
    });

    expectObservable(scan).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should accept array typed reducers', () => {
    type(() => {
      let a: Rx.Observable<{ a: number; b: string }>;
      a.reduce((acc, value) => acc.concat(value), []);
    });
  });

  it('should accept T typed reducers', () => {
    type(() => {
      let a: Rx.Observable<{ a?: number; b?: string }>;
      a.reduce((acc, value) => {
        value.a = acc.a;
        value.b = acc.b;
        return acc;
      }, {});
    });
  });

  it('should accept R typed reducers', () => {
    type(() => {
      let a: Rx.Observable<{ a: number; b: string }>;
      a.reduce<{ a?: number; b?: string }>((acc, value) => {
        value.a = acc.a;
        value.b = acc.b;
        return acc;
      }, {});
    });
  });
});
