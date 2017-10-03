//// [genericPrototypeProperty2.ts]
interface EventTarget { x } 
class BaseEvent {
    target: EventTarget;
}

class MyEvent<T extends EventTarget> extends BaseEvent {
    target: T;
}
class BaseEventWrapper {
    t: BaseEvent;
}

class MyEventWrapper extends BaseEventWrapper {
    t: MyEvent<any>; // any satisfies constraint and passes assignability check between 'target' properties
}

//// [genericPrototypeProperty2.js]
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var BaseEvent = (function () {
    function BaseEvent() {
    }
    return BaseEvent;
}());
var MyEvent = (function (_super) {
    __extends(MyEvent, _super);
    function MyEvent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MyEvent;
}(BaseEvent));
var BaseEventWrapper = (function () {
    function BaseEventWrapper() {
    }
    return BaseEventWrapper;
}());
var MyEventWrapper = (function (_super) {
    __extends(MyEventWrapper, _super);
    function MyEventWrapper() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MyEventWrapper;
}(BaseEventWrapper));
