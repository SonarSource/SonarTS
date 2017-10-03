//// [destructuringParameterDeclaration5.ts]
// Parameter Declaration with generic

interface F { }
class Class implements F {
    constructor() { }
}

class SubClass extends Class {
    foo: boolean;
    constructor() { super(); }
}

class D implements F {
    foo: boolean
    constructor() { }
}

class SubD extends D {
    bar: number
    constructor() {
        super();
    }
}


function d0<T extends Class>({x} = { x: new Class() }) { }
function d1<T extends F>({x}: { x: F }) { }
function d2<T extends Class>({x}: { x: Class }) { }
function d3<T extends D>({y}: { y: D }) { }
function d4<T extends D>({y} = { y: new D() }) { }

var obj = new Class();
d0({ x: 1 });
d0({ x: {} });
d0({ x: "string" });

d1({ x: new Class() });
d1({ x: {} });
d1({ x: "string" });

d2({ x: new SubClass() });
d2({ x: {} });

d3({ y: new SubD() });
d3({ y: new SubClass() });
// Error
d3({ y: new Class() });
d3({});
d3({ y: 1 });
d3({ y: "world" });

//// [destructuringParameterDeclaration5.js]
// Parameter Declaration with generic
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
var Class = (function () {
    function Class() {
    }
    return Class;
}());
var SubClass = (function (_super) {
    __extends(SubClass, _super);
    function SubClass() {
        return _super.call(this) || this;
    }
    return SubClass;
}(Class));
var D = (function () {
    function D() {
    }
    return D;
}());
var SubD = (function (_super) {
    __extends(SubD, _super);
    function SubD() {
        return _super.call(this) || this;
    }
    return SubD;
}(D));
function d0(_a) {
    var x = (_a === void 0 ? { x: new Class() } : _a).x;
}
function d1(_a) {
    var x = _a.x;
}
function d2(_a) {
    var x = _a.x;
}
function d3(_a) {
    var y = _a.y;
}
function d4(_a) {
    var y = (_a === void 0 ? { y: new D() } : _a).y;
}
var obj = new Class();
d0({ x: 1 });
d0({ x: {} });
d0({ x: "string" });
d1({ x: new Class() });
d1({ x: {} });
d1({ x: "string" });
d2({ x: new SubClass() });
d2({ x: {} });
d3({ y: new SubD() });
d3({ y: new SubClass() });
// Error
d3({ y: new Class() });
d3({});
d3({ y: 1 });
d3({ y: "world" });
