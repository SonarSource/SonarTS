/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '@angular/core';
import {NgZone} from '@angular/core/src/zone/ng_zone';
import {ClientMessageBroker, ClientMessageBrokerFactory_, UiArguments} from '@angular/platform-webworker/src/web_workers/shared/client_message_broker';
import {MessageBus, MessageBusSink, MessageBusSource} from '@angular/platform-webworker/src/web_workers/shared/message_bus';
import {SpyMessageBroker} from '../worker/spies';

import {MockEventEmitter} from './mock_event_emitter';

/**
 * Returns two MessageBus instances that are attached to each other.
 * Such that whatever goes into one's sink comes out the others source.
 */
export function createPairedMessageBuses(): PairedMessageBuses {
  const firstChannels: {[key: string]: MockEventEmitter<any>} = {};
  const workerMessageBusSink = new MockMessageBusSink(firstChannels);
  const uiMessageBusSource = new MockMessageBusSource(firstChannels);

  const secondChannels: {[key: string]: MockEventEmitter<any>} = {};
  const uiMessageBusSink = new MockMessageBusSink(secondChannels);
  const workerMessageBusSource = new MockMessageBusSource(secondChannels);

  return new PairedMessageBuses(
      new MockMessageBus(uiMessageBusSink, uiMessageBusSource),
      new MockMessageBus(workerMessageBusSink, workerMessageBusSource));
}

/**
 * Spies on the given {@link SpyMessageBroker} and expects a call with the given methodName
 * andvalues.
 * If a handler is provided it will be called to handle the request.
 * Only intended to be called on a given broker instance once.
 */
export function expectBrokerCall(
    broker: SpyMessageBroker, methodName: string, vals?: Array<any>,
    handler?: (..._: any[]) => Promise<any>| void): void {
  broker.spy('runOnService').and.callFake((args: UiArguments, returnType: Type<any>) => {
    expect(args.method).toEqual(methodName);
    if (vals != null) {
      expect(args.args !.length).toEqual(vals.length);
      vals.forEach((v, i) => { expect(v).toEqual(args.args ![i].value); });
    }
    let promise: Promise<any>|void = null !;
    if (handler != null) {
      const givenValues = args.args !.map((arg) => arg.value);
      if (givenValues.length > 0) {
        promise = handler(givenValues);
      } else {
        promise = handler();
      }
    }
    if (promise == null) {
      promise = new Promise((res, rej) => {
        try {
          res();
        } catch (e) {
          rej(e);
        }
      });
    }
    return promise;
  });
}

export class PairedMessageBuses {
  constructor(public ui: MessageBus, public worker: MessageBus) {}
}

export class MockMessageBusSource implements MessageBusSource {
  constructor(private _channels: {[key: string]: MockEventEmitter<any>}) {}

  initChannel(channel: string, runInZone = true) {
    if (!this._channels.hasOwnProperty(channel)) {
      this._channels[channel] = new MockEventEmitter();
    }
  }

  from(channel: string): MockEventEmitter<any> {
    if (!this._channels.hasOwnProperty(channel)) {
      throw new Error(`${channel} is not set up. Did you forget to call initChannel?`);
    }
    return this._channels[channel];
  }

  attachToZone(zone: NgZone) {}
}

export class MockMessageBusSink implements MessageBusSink {
  constructor(private _channels: {[key: string]: MockEventEmitter<any>}) {}

  initChannel(channel: string, runInZone = true) {
    if (!this._channels.hasOwnProperty(channel)) {
      this._channels[channel] = new MockEventEmitter();
    }
  }

  to(channel: string): MockEventEmitter<any> {
    if (!this._channels.hasOwnProperty(channel)) {
      this._channels[channel] = new MockEventEmitter();
    }
    return this._channels[channel];
  }

  attachToZone(zone: NgZone) {}
}

/**
 * Mock implementation of the {@link MessageBus} for tests.
 * Runs syncronously, and does not support running within the zone.
 */
export class MockMessageBus extends MessageBus {
  constructor(public sink: MockMessageBusSink, public source: MockMessageBusSource) { super(); }

  initChannel(channel: string, runInZone = true) {
    this.sink.initChannel(channel, runInZone);
    this.source.initChannel(channel, runInZone);
  }

  to(channel: string): MockEventEmitter<any> { return this.sink.to(channel); }

  from(channel: string): MockEventEmitter<any> { return this.source.from(channel); }

  attachToZone(zone: NgZone) {}
}

export class MockMessageBrokerFactory extends ClientMessageBrokerFactory_ {
  constructor(private _messageBroker: ClientMessageBroker) { super(null !, null !); }
  createMessageBroker(channel: string, runInZone = true) { return this._messageBroker; }
}
