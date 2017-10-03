import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
import {TestScheduler} from '../../dist/cjs/testing/TestScheduler';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const hot: typeof marbleTestingSignature.hot;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;

declare const rxTestScheduler: TestScheduler;

const ReplaySubject = Rx.ReplaySubject;
const Observable = Rx.Observable;

/** @test {ReplaySubject} */
describe('ReplaySubject', () => {
  it('should extend Subject', () => {
    const subject = new ReplaySubject();
    expect(subject).to.be.instanceof(Rx.Subject);
  });

  it('should add the observer before running subscription code', () => {
    const subject = new ReplaySubject<number>();
    subject.next(1);
    const results = [];

    subject.subscribe((value) => {
      results.push(value);
      if (value < 3) {
        subject.next(value + 1);
      }
    });

    expect(results).to.deep.equal([1, 2, 3]);
  });

  it('should replay values upon subscription', (done: MochaDone) => {
    const subject = new ReplaySubject();
    const expects = [1, 2, 3];
    let i = 0;
    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.subscribe((x: number) => {
      expect(x).to.equal(expects[i++]);
      if (i === 3) {
        subject.complete();
      }
    }, (err: any) => {
      done(new Error('should not be called'));
    }, () => {
      done();
    });
  });

  it('should replay values and complete', (done: MochaDone) => {
    const subject = new ReplaySubject();
    const expects = [1, 2, 3];
    let i = 0;
    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.complete();
    subject.subscribe((x: number) => {
      expect(x).to.equal(expects[i++]);
    }, null, done);
  });

  it('should replay values and error', (done: MochaDone) => {
    const subject = new ReplaySubject();
    const expects = [1, 2, 3];
    let i = 0;
    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.error('fooey');
    subject.subscribe((x: number) => {
      expect(x).to.equal(expects[i++]);
    }, (err: any) => {
      expect(err).to.equal('fooey');
      done();
    });
  });

  it('should only replay values within its buffer size', (done: MochaDone) => {
    const subject = new ReplaySubject(2);
    const expects = [2, 3];
    let i = 0;
    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.subscribe((x: number) => {
      expect(x).to.equal(expects[i++]);
      if (i === 2) {
        subject.complete();
      }
    }, (err: any) => {
      done(new Error('should not be called'));
    }, () => {
      done();
    });
  });

  describe('with bufferSize=2', () => {
    it('should replay 2 previous values when subscribed', () => {
      const replaySubject = new ReplaySubject(2);
      function feedNextIntoSubject(x) { replaySubject.next(x); }
      function feedErrorIntoSubject(err) { replaySubject.error(err); }
      function feedCompleteIntoSubject() { replaySubject.complete(); }

      const sourceTemplate =  '-1-2-3----4------5-6---7--8----9--|';
      const subscriber1 = hot('      (a|)                         ').mergeMapTo(replaySubject);
      const unsub1 =          '                     !             ';
      const expected1   =     '      (23)4------5-6--             ';
      const subscriber2 = hot('            (b|)                   ').mergeMapTo(replaySubject);
      const unsub2 =          '                         !         ';
      const expected2   =     '            (34)-5-6---7--         ';
      const subscriber3 = hot('                           (c|)    ').mergeMapTo(replaySubject);
      const expected3   =     '                           (78)9--|';

      expectObservable(hot(sourceTemplate).do(
        feedNextIntoSubject, feedErrorIntoSubject, feedCompleteIntoSubject
      )).toBe(sourceTemplate);
      expectObservable(subscriber1, unsub1).toBe(expected1);
      expectObservable(subscriber2, unsub2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
    });

    it('should replay 2 last values for when subscribed after completed', () => {
      const replaySubject = new ReplaySubject(2);
      function feedNextIntoSubject(x) { replaySubject.next(x); }
      function feedErrorIntoSubject(err) { replaySubject.error(err); }
      function feedCompleteIntoSubject() { replaySubject.complete(); }

      const sourceTemplate =  '-1-2-3--4--|';
      const subscriber1 = hot('               (a|) ').mergeMapTo(replaySubject);
      const expected1   =     '               (34|)';

      expectObservable(hot(sourceTemplate).do(
        feedNextIntoSubject, feedErrorIntoSubject, feedCompleteIntoSubject
      )).toBe(sourceTemplate);
      expectObservable(subscriber1).toBe(expected1);
    });

    it('should handle subscribers that arrive and leave at different times, ' +
    'subject does not complete', () => {
      const subject = new ReplaySubject(2);
      const results1 = [];
      const results2 = [];
      const results3 = [];

      subject.next(1);
      subject.next(2);
      subject.next(3);
      subject.next(4);

      const subscription1 = subject.subscribe(
        (x: number) => { results1.push(x); },
        (err: any) => { results1.push('E'); },
        () => { results1.push('C'); }
      );

      subject.next(5);

      const subscription2 = subject.subscribe(
        (x: number) => { results2.push(x); },
        (err: any) => { results2.push('E'); },
        () => { results2.push('C'); }
      );

      subject.next(6);
      subject.next(7);

      subscription1.unsubscribe();

      subject.next(8);

      subscription2.unsubscribe();

      subject.next(9);
      subject.next(10);

      const subscription3 = subject.subscribe(
        (x: number) => { results3.push(x); },
        (err: any) => { results3.push('E'); },
        () => { results3.push('C'); }
      );

      subject.next(11);

      subscription3.unsubscribe();

      expect(results1).to.deep.equal([3, 4, 5, 6, 7]);
      expect(results2).to.deep.equal([4, 5, 6, 7, 8]);
      expect(results3).to.deep.equal([9, 10, 11]);

      subject.complete();
    });
  });

  describe('with windowTime=40', () => {
    it('should replay previous values since 40 time units ago when subscribed', () => {
      const replaySubject = new ReplaySubject(Number.POSITIVE_INFINITY, 40, rxTestScheduler);
      function feedNextIntoSubject(x) { replaySubject.next(x); }
      function feedErrorIntoSubject(err) { replaySubject.error(err); }
      function feedCompleteIntoSubject() { replaySubject.complete(); }

      const sourceTemplate =  '-1-2-3----4------5-6----7-8----9--|';
      const subscriber1 = hot('      (a|)                         ').mergeMapTo(replaySubject);
      const unsub1 =          '                     !             ';
      const expected1   =     '      (23)4------5-6--             ';
      const subscriber2 = hot('            (b|)                   ').mergeMapTo(replaySubject);
      const unsub2 =          '                         !         ';
      const expected2   =     '            4----5-6----7-         ';
      const subscriber3 = hot('                           (c|)    ').mergeMapTo(replaySubject);
      const expected3   =     '                           (78)9--|';

      expectObservable(hot(sourceTemplate).do(
        feedNextIntoSubject, feedErrorIntoSubject, feedCompleteIntoSubject
      )).toBe(sourceTemplate);
      expectObservable(subscriber1, unsub1).toBe(expected1);
      expectObservable(subscriber2, unsub2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
    });

    it('should replay last values since 40 time units ago when subscribed', () => {
      const replaySubject = new ReplaySubject(Number.POSITIVE_INFINITY, 40, rxTestScheduler);
      function feedNextIntoSubject(x) { replaySubject.next(x); }
      function feedErrorIntoSubject(err) { replaySubject.error(err); }
      function feedCompleteIntoSubject() { replaySubject.complete(); }

      const sourceTemplate =  '-1-2-3----4|';
      const subscriber1 = hot('             (a|)').mergeMapTo(replaySubject);
      const expected1   =     '             (4|)';

      expectObservable(hot(sourceTemplate).do(
        feedNextIntoSubject, feedErrorIntoSubject, feedCompleteIntoSubject
      )).toBe(sourceTemplate);
      expectObservable(subscriber1).toBe(expected1);
    });
  });

  it('should be an Observer which can be given to Observable.subscribe', () => {
    const source = Observable.of(1, 2, 3, 4, 5);
    const subject = new ReplaySubject(3);
    let results = [];

    subject.subscribe(x => results.push(x), null, () => results.push('done'));

    source.subscribe(subject);

    expect(results).to.deep.equal([1, 2, 3, 4, 5, 'done']);

    results = [];

    subject.subscribe(x => results.push(x), null, () => results.push('done'));

    expect(results).to.deep.equal([3, 4, 5, 'done']);
  });
});