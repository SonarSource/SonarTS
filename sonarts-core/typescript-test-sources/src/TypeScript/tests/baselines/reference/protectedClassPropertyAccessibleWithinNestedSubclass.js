//// [protectedClassPropertyAccessibleWithinNestedSubclass.ts]
class B {
    protected x: string;
    protected static x: string;
}

class C extends B {
    protected get y() { return this.x; }
    protected set y(x) { this.y = this.x; }
    protected foo() { return this.x; }

    protected static get y() { return this.x; }
    protected static set y(x) { this.y = this.x; }
    protected static foo() { return this.x; }
    protected static bar() { this.foo(); }
    
    protected bar() { 
        class D {
            protected foo() {
                var c = new C();
                var c1 = c.y;
                var c2 = c.x;
                var c3 = c.foo;
                var c4 = c.bar;
                var c5 = c.z; // error
                
                var sc1 = C.x;
                var sc2 = C.y;
                var sc3 = C.foo;
                var sc4 = C.bar;
            }
        }
    }
}

class E extends C {
    protected z: string;
}

//// [protectedClassPropertyAccessibleWithinNestedSubclass.js]
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
var B = (function () {
    function B() {
    }
    return B;
}());
var C = (function (_super) {
    __extends(C, _super);
    function C() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(C.prototype, "y", {
        get: function () { return this.x; },
        set: function (x) { this.y = this.x; },
        enumerable: true,
        configurable: true
    });
    C.prototype.foo = function () { return this.x; };
    Object.defineProperty(C, "y", {
        get: function () { return this.x; },
        set: function (x) { this.y = this.x; },
        enumerable: true,
        configurable: true
    });
    C.foo = function () { return this.x; };
    C.bar = function () { this.foo(); };
    C.prototype.bar = function () {
        var D = (function () {
            function D() {
            }
            D.prototype.foo = function () {
                var c = new C();
                var c1 = c.y;
                var c2 = c.x;
                var c3 = c.foo;
                var c4 = c.bar;
                var c5 = c.z; // error
                var sc1 = C.x;
                var sc2 = C.y;
                var sc3 = C.foo;
                var sc4 = C.bar;
            };
            return D;
        }());
    };
    return C;
}(B));
var E = (function (_super) {
    __extends(E, _super);
    function E() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return E;
}(C));
