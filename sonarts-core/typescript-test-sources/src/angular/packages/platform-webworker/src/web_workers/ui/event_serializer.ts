/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const MOUSE_EVENT_PROPERTIES = [
  'altKey', 'button', 'clientX', 'clientY', 'metaKey', 'movementX', 'movementY', 'offsetX',
  'offsetY', 'region', 'screenX', 'screenY', 'shiftKey'
];

const KEYBOARD_EVENT_PROPERTIES = [
  'altkey', 'charCode', 'code', 'ctrlKey', 'isComposing', 'key', 'keyCode', 'location', 'metaKey',
  'repeat', 'shiftKey', 'which'
];

const TRANSITION_EVENT_PROPERTIES = ['propertyName', 'elapsedTime', 'pseudoElement'];

const EVENT_PROPERTIES = ['type', 'bubbles', 'cancelable'];

const NODES_WITH_VALUE = new Set(
    ['input', 'select', 'option', 'button', 'li', 'meter', 'progress', 'param', 'textarea']);

export function serializeGenericEvent(e: Event): {[key: string]: any} {
  return serializeEvent(e, EVENT_PROPERTIES);
}

// TODO(jteplitz602): Allow users to specify the properties they need rather than always
// adding value and files #3374
export function serializeEventWithTarget(e: Event): {[key: string]: any} {
  const serializedEvent = serializeEvent(e, EVENT_PROPERTIES);
  return addTarget(e, serializedEvent);
}

export function serializeMouseEvent(e: MouseEvent): {[key: string]: any} {
  return serializeEvent(e, MOUSE_EVENT_PROPERTIES);
}

export function serializeKeyboardEvent(e: KeyboardEvent): {[key: string]: any} {
  const serializedEvent = serializeEvent(e, KEYBOARD_EVENT_PROPERTIES);
  return addTarget(e, serializedEvent);
}

export function serializeTransitionEvent(e: TransitionEvent): {[key: string]: any} {
  const serializedEvent = serializeEvent(e, TRANSITION_EVENT_PROPERTIES);
  return addTarget(e, serializedEvent);
}

// TODO(jteplitz602): #3374. See above.
function addTarget(e: Event, serializedEvent: {[key: string]: any}): {[key: string]: any} {
  if (NODES_WITH_VALUE.has((<HTMLElement>e.target).tagName.toLowerCase())) {
    const target = <HTMLInputElement>e.target;
    serializedEvent['target'] = {'value': target.value};
    if (target.files) {
      serializedEvent['target']['files'] = target.files;
    }
  }
  return serializedEvent;
}

function serializeEvent(e: any, properties: string[]): {[key: string]: any} {
  const serialized: {[k: string]: any} = {};
  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i];
    serialized[prop] = e[prop];
  }
  return serialized;
}
