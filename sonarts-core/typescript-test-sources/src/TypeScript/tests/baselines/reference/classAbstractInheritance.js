//// [classAbstractInheritance.ts]
abstract class A {}

abstract class B extends A {}

class C extends A {}

abstract class AA {
    abstract foo();
}

abstract class BB extends AA {}

class CC extends AA {}

class DD extends BB {}

abstract class EE extends BB {}

class FF extends CC {}

abstract class GG extends CC {}

//// [classAbstractInheritance.js]
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
var A = (function () {
    function A() {
    }
    return A;
}());
var B = (function (_super) {
    __extends(B, _super);
    function B() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return B;
}(A));
var C = (function (_super) {
    __extends(C, _super);
    function C() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return C;
}(A));
var AA = (function () {
    function AA() {
    }
    return AA;
}());
var BB = (function (_super) {
    __extends(BB, _super);
    function BB() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return BB;
}(AA));
var CC = (function (_super) {
    __extends(CC, _super);
    function CC() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CC;
}(AA));
var DD = (function (_super) {
    __extends(DD, _super);
    function DD() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DD;
}(BB));
var EE = (function (_super) {
    __extends(EE, _super);
    function EE() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return EE;
}(BB));
var FF = (function (_super) {
    __extends(FF, _super);
    function FF() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return FF;
}(CC));
var GG = (function (_super) {
    __extends(GG, _super);
    function GG() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return GG;
}(CC));
