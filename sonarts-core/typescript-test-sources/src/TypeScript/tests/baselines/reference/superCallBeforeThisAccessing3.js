//// [superCallBeforeThisAccessing3.ts]
class Base {
    constructor(c) { }
}
class D extends Base {
    private _t;
    constructor() {
        let x = () => { this._t };
        x();  // no error; we only check super is called before this when the container is a constructor
        this._t;  // error
        super(undefined);
    }
}


//// [superCallBeforeThisAccessing3.js]
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
var Base = (function () {
    function Base(c) {
    }
    return Base;
}());
var D = (function (_super) {
    __extends(D, _super);
    function D() {
        var _this = this;
        var x = function () { _this._t; };
        x(); // no error; we only check super is called before this when the container is a constructor
        _this._t; // error
        _this = _super.call(this, undefined) || this;
        return _this;
    }
    return D;
}(Base));
