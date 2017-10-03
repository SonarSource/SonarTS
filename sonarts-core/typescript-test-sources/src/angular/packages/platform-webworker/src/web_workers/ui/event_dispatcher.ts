/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {EventEmitter} from '@angular/core';
import {Serializer, SerializerTypes} from '../shared/serializer';

import {serializeEventWithTarget, serializeGenericEvent, serializeKeyboardEvent, serializeMouseEvent, serializeTransitionEvent} from './event_serializer';

export class EventDispatcher {
  constructor(private _sink: EventEmitter<any>, private _serializer: Serializer) {}

  dispatchAnimationEvent(player: any, phaseName: string, element: any): boolean {
    this._sink.emit({
      'element': this._serializer.serialize(element, SerializerTypes.RENDER_STORE_OBJECT),
      'animationPlayer': this._serializer.serialize(player, SerializerTypes.RENDER_STORE_OBJECT),
      'phaseName': phaseName,
    });
    return true;
  }

  dispatchRenderEvent(element: any, eventTarget: string, eventName: string, event: any): boolean {
    let serializedEvent: any;
    // TODO (jteplitz602): support custom events #3350
    switch (event.type) {
      case 'click':
      case 'mouseup':
      case 'mousedown':
      case 'dblclick':
      case 'contextmenu':
      case 'mouseenter':
      case 'mouseleave':
      case 'mousemove':
      case 'mouseout':
      case 'mouseover':
      case 'show':
        serializedEvent = serializeMouseEvent(event);
        break;
      case 'keydown':
      case 'keypress':
      case 'keyup':
        serializedEvent = serializeKeyboardEvent(event);
        break;
      case 'input':
      case 'change':
      case 'blur':
        serializedEvent = serializeEventWithTarget(event);
        break;
      case 'abort':
      case 'afterprint':
      case 'beforeprint':
      case 'cached':
      case 'canplay':
      case 'canplaythrough':
      case 'chargingchange':
      case 'chargingtimechange':
      case 'close':
      case 'dischargingtimechange':
      case 'DOMContentLoaded':
      case 'downloading':
      case 'durationchange':
      case 'emptied':
      case 'ended':
      case 'error':
      case 'fullscreenchange':
      case 'fullscreenerror':
      case 'invalid':
      case 'languagechange':
      case 'levelfchange':
      case 'loadeddata':
      case 'loadedmetadata':
      case 'obsolete':
      case 'offline':
      case 'online':
      case 'open':
      case 'orientatoinchange':
      case 'pause':
      case 'pointerlockchange':
      case 'pointerlockerror':
      case 'play':
      case 'playing':
      case 'ratechange':
      case 'readystatechange':
      case 'reset':
      case 'scroll':
      case 'seeked':
      case 'seeking':
      case 'stalled':
      case 'submit':
      case 'success':
      case 'suspend':
      case 'timeupdate':
      case 'updateready':
      case 'visibilitychange':
      case 'volumechange':
      case 'waiting':
        serializedEvent = serializeGenericEvent(event);
        break;
      case 'transitionend':
        serializedEvent = serializeTransitionEvent(event);
        break;
      default:
        throw new Error(eventName + ' not supported on WebWorkers');
    }

    this._sink.emit({
      'element': this._serializer.serialize(element, SerializerTypes.RENDER_STORE_OBJECT),
      'eventName': eventName,
      'eventTarget': eventTarget,
      'event': serializedEvent,
    });

    // TODO(kegluneq): Eventually, we want the user to indicate from the UI side whether the event
    // should be canceled, but for now just call `preventDefault` on the original DOM event.
    return false;
  }
}
