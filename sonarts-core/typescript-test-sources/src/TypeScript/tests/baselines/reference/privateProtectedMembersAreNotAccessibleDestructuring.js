//// [privateProtectedMembersAreNotAccessibleDestructuring.ts]
class K {
    private priv;
    protected prot;
    private privateMethod() { }
    m() {
        let { priv: a, prot: b } = this; // ok
        let { priv, prot } = new K(); // ok
    }
}
class C extends K {
    m2() {
        let { priv: a } = this; // error
        let { prot: b } = this; // ok
    }
}
let k = new K();
let { priv } = k; // error 
let { prot } = k; // error
let { privateMethod } = k; // error
let { priv: a, prot: b, privateMethod: f } = k; // error


//// [privateProtectedMembersAreNotAccessibleDestructuring.js]
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
var K = (function () {
    function K() {
    }
    K.prototype.privateMethod = function () { };
    K.prototype.m = function () {
        var _a = this, a = _a.priv, b = _a.prot; // ok
        var _b = new K(), priv = _b.priv, prot = _b.prot; // ok
    };
    return K;
}());
var C = (function (_super) {
    __extends(C, _super);
    function C() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    C.prototype.m2 = function () {
        var a = this.priv; // error
        var b = this.prot; // ok
    };
    return C;
}(K));
var k = new K();
var priv = k.priv; // error 
var prot = k.prot; // error
var privateMethod = k.privateMethod; // error
var a = k.priv, b = k.prot, f = k.privateMethod; // error
