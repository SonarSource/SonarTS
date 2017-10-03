//// [functionSubtypingOfVarArgs.ts]
class EventBase {
    private _listeners = [];

    add(listener: (...args: any[]) => void): void {
        this._listeners.push(listener);
    }
}

class StringEvent extends EventBase { // should work
    add(listener: (items: string) => void ) { // valid, items is subtype of args
        super.add(listener);
    }
}


//// [functionSubtypingOfVarArgs.js]
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
var EventBase = (function () {
    function EventBase() {
        this._listeners = [];
    }
    EventBase.prototype.add = function (listener) {
        this._listeners.push(listener);
    };
    return EventBase;
}());
var StringEvent = (function (_super) {
    __extends(StringEvent, _super);
    function StringEvent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StringEvent.prototype.add = function (listener) {
        _super.prototype.add.call(this, listener);
    };
    return StringEvent;
}(EventBase));
