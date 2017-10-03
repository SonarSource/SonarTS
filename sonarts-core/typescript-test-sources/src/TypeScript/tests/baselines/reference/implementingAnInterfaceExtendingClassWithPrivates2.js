//// [implementingAnInterfaceExtendingClassWithPrivates2.ts]
class Foo {
    private x: string;
}

interface I extends Foo {
    y: number;
}

class Bar extends Foo implements I { // ok
    y: number;
}

class Bar2 extends Foo implements I { // error
    x: string;
    y: number;
}

class Bar3 extends Foo implements I { // error
    private x: string;
    y: number;
}

// another level of indirection
module M {
    class Foo {
        private x: string;
    }

    class Baz extends Foo {
        z: number;
    }

    interface I extends Baz {
        y: number;
    }

    class Bar extends Foo implements I { // ok
        y: number;
        z: number;
    }

    class Bar2 extends Foo implements I { // error
        x: string;
        y: number;
    }

    class Bar3 extends Foo implements I { // error
        private x: string;
        y: number;
    }
}

// two levels of privates
module M2 {
    class Foo {
        private x: string;
    }

    class Baz extends Foo {
        private y: number;
    }

    interface I extends Baz {
        z: number;
    }

    class Bar extends Foo implements I { // error
        z: number;
    }

    var b: Bar;
    var r1 = b.z;
    var r2 = b.x; // error
    var r3 = b.y; // error

    class Bar2 extends Foo implements I { // error
        x: string;
        z: number;
    }

    class Bar3 extends Foo implements I { // error
        private x: string;
        z: number;
    }
}

//// [implementingAnInterfaceExtendingClassWithPrivates2.js]
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
var Foo = (function () {
    function Foo() {
    }
    return Foo;
}());
var Bar = (function (_super) {
    __extends(Bar, _super);
    function Bar() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Bar;
}(Foo));
var Bar2 = (function (_super) {
    __extends(Bar2, _super);
    function Bar2() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Bar2;
}(Foo));
var Bar3 = (function (_super) {
    __extends(Bar3, _super);
    function Bar3() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Bar3;
}(Foo));
// another level of indirection
var M;
(function (M) {
    var Foo = (function () {
        function Foo() {
        }
        return Foo;
    }());
    var Baz = (function (_super) {
        __extends(Baz, _super);
        function Baz() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Baz;
    }(Foo));
    var Bar = (function (_super) {
        __extends(Bar, _super);
        function Bar() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Bar;
    }(Foo));
    var Bar2 = (function (_super) {
        __extends(Bar2, _super);
        function Bar2() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Bar2;
    }(Foo));
    var Bar3 = (function (_super) {
        __extends(Bar3, _super);
        function Bar3() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Bar3;
    }(Foo));
})(M || (M = {}));
// two levels of privates
var M2;
(function (M2) {
    var Foo = (function () {
        function Foo() {
        }
        return Foo;
    }());
    var Baz = (function (_super) {
        __extends(Baz, _super);
        function Baz() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Baz;
    }(Foo));
    var Bar = (function (_super) {
        __extends(Bar, _super);
        function Bar() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Bar;
    }(Foo));
    var b;
    var r1 = b.z;
    var r2 = b.x; // error
    var r3 = b.y; // error
    var Bar2 = (function (_super) {
        __extends(Bar2, _super);
        function Bar2() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Bar2;
    }(Foo));
    var Bar3 = (function (_super) {
        __extends(Bar3, _super);
        function Bar3() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Bar3;
    }(Foo));
})(M2 || (M2 = {}));
