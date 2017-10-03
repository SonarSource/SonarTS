//// [extendFromAny.ts]
declare var Base: any;
class C extends Base {
    known = 1;
    static sknown = 2;
}

let c = new C();
c.known.length; // error, 'known' has no 'length' property
C.sknown.length; // error, 'sknown' has no 'length' property
c.unknown.length; // ok, unknown: any
C.sunknown.length; // ok: sunknown: any


//// [extendFromAny.js]
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
var C = (function (_super) {
    __extends(C, _super);
    function C() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.known = 1;
        return _this;
    }
    return C;
}(Base));
C.sknown = 2;
var c = new C();
c.known.length; // error, 'known' has no 'length' property
C.sknown.length; // error, 'sknown' has no 'length' property
c.unknown.length; // ok, unknown: any
C.sunknown.length; // ok: sunknown: any
