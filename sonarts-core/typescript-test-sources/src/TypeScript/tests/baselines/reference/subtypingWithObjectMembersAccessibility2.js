//// [subtypingWithObjectMembersAccessibility2.ts]
// Derived member is private, base member is not causes errors

class Base {
    foo: string;
}

class Derived extends Base {
    bar: string;
}

module ExplicitPublic {
    class A {
        private foo: Base;
    }

    class B extends A {
        public foo: Derived; // error
    }

    class A2 {
        private 1: Base;
    }

    class B2 extends A2 {
        public 1: Derived; // error
    }

    class A3 {
        private '1': Base;
    }

    class B3 extends A3 {
        public '1': Derived; // error
    }
}

module ImplicitPublic {
    class A {
        private foo: Base;
    }

    class B extends A {
        foo: Derived; // error
    }

    class A2 {
        private 1: Base;
    }

    class B2 extends A2 {
        1: Derived; // error
    }

    class A3 {
        private '1': Base;
    }

    class B3 extends A3 {
        '1': Derived; // error
    }
}

//// [subtypingWithObjectMembersAccessibility2.js]
// Derived member is private, base member is not causes errors
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
    function Base() {
    }
    return Base;
}());
var Derived = (function (_super) {
    __extends(Derived, _super);
    function Derived() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Derived;
}(Base));
var ExplicitPublic;
(function (ExplicitPublic) {
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
    var A2 = (function () {
        function A2() {
        }
        return A2;
    }());
    var B2 = (function (_super) {
        __extends(B2, _super);
        function B2() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return B2;
    }(A2));
    var A3 = (function () {
        function A3() {
        }
        return A3;
    }());
    var B3 = (function (_super) {
        __extends(B3, _super);
        function B3() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return B3;
    }(A3));
})(ExplicitPublic || (ExplicitPublic = {}));
var ImplicitPublic;
(function (ImplicitPublic) {
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
    var A2 = (function () {
        function A2() {
        }
        return A2;
    }());
    var B2 = (function (_super) {
        __extends(B2, _super);
        function B2() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return B2;
    }(A2));
    var A3 = (function () {
        function A3() {
        }
        return A3;
    }());
    var B3 = (function (_super) {
        __extends(B3, _super);
        function B3() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return B3;
    }(A3));
})(ImplicitPublic || (ImplicitPublic = {}));
