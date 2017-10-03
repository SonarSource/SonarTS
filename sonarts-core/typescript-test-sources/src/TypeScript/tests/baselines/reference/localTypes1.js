//// [localTypes1.ts]
function f1() {
    enum E {
        A, B, C
    }
    class C {
        x: E;
    }
    interface I {
        x: E;
    }
    type A = I[];
    let a: A = [new C()];
    a[0].x = E.B;
    return a;
}

function f2() {
    function g() {
        enum E {
            A, B, C
        }
        class C {
            x: E;
        }
        interface I {
            x: E;
        }
        type A = I[];
        let a: A = [new C()];
        a[0].x = E.B;
        return a;
    }
    return g();
}

function f3(b: boolean) {
    if (true) {
        enum E {
            A, B, C
        }
        if (b) {
            class C {
                x: E;
            }
            interface I {
                x: E;
            }
            type A = I[];
            let a: A = [new C()];
            a[0].x = E.B;
            return a;
        }
        else {
            class A {
                x: E;
            }
            interface J {
                x: E;
            }
            type C = J[];
            let c: C = [new A()];
            c[0].x = E.B;
            return c;
        }
    }
}

function f5() {
    var z1 = function () {
        enum E {
            A, B, C
        }
        class C {
            x: E;
        }
        return new C();
    }
    var z2 = () => {
        enum E {
            A, B, C
        }
        class C {
            x: E;
        }
        return new C();
    }
}

class A {
    constructor() {
        enum E {
            A, B, C
        }
        class C {
            x: E;
        }
    }
    m() {
        enum E {
            A, B, C
        }
        class C {
            x: E;
        }
        return new C();
    }
    get p() {
        enum E {
            A, B, C
        }
        class C {
            x: E;
        }
        return new C();
    }
}

function f6() {
    class A {
        a: string;
    }
    function g() {
        class B extends A {
            b: string;
        }
        function h() {
            class C extends B {
                c: string;
            }
            var x = new C();
            x.a = "a";
            x.b = "b";
            x.c = "c";
            return x;
        }
        return h();
    }
    return g();
}


//// [localTypes1.js]
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
function f1() {
    var E;
    (function (E) {
        E[E["A"] = 0] = "A";
        E[E["B"] = 1] = "B";
        E[E["C"] = 2] = "C";
    })(E || (E = {}));
    var C = (function () {
        function C() {
        }
        return C;
    }());
    var a = [new C()];
    a[0].x = E.B;
    return a;
}
function f2() {
    function g() {
        var E;
        (function (E) {
            E[E["A"] = 0] = "A";
            E[E["B"] = 1] = "B";
            E[E["C"] = 2] = "C";
        })(E || (E = {}));
        var C = (function () {
            function C() {
            }
            return C;
        }());
        var a = [new C()];
        a[0].x = E.B;
        return a;
    }
    return g();
}
function f3(b) {
    if (true) {
        var E = void 0;
        (function (E) {
            E[E["A"] = 0] = "A";
            E[E["B"] = 1] = "B";
            E[E["C"] = 2] = "C";
        })(E || (E = {}));
        if (b) {
            var C = (function () {
                function C() {
                }
                return C;
            }());
            var a = [new C()];
            a[0].x = E.B;
            return a;
        }
        else {
            var A_1 = (function () {
                function A() {
                }
                return A;
            }());
            var c = [new A_1()];
            c[0].x = E.B;
            return c;
        }
    }
}
function f5() {
    var z1 = function () {
        var E;
        (function (E) {
            E[E["A"] = 0] = "A";
            E[E["B"] = 1] = "B";
            E[E["C"] = 2] = "C";
        })(E || (E = {}));
        var C = (function () {
            function C() {
            }
            return C;
        }());
        return new C();
    };
    var z2 = function () {
        var E;
        (function (E) {
            E[E["A"] = 0] = "A";
            E[E["B"] = 1] = "B";
            E[E["C"] = 2] = "C";
        })(E || (E = {}));
        var C = (function () {
            function C() {
            }
            return C;
        }());
        return new C();
    };
}
var A = (function () {
    function A() {
        var E;
        (function (E) {
            E[E["A"] = 0] = "A";
            E[E["B"] = 1] = "B";
            E[E["C"] = 2] = "C";
        })(E || (E = {}));
        var C = (function () {
            function C() {
            }
            return C;
        }());
    }
    A.prototype.m = function () {
        var E;
        (function (E) {
            E[E["A"] = 0] = "A";
            E[E["B"] = 1] = "B";
            E[E["C"] = 2] = "C";
        })(E || (E = {}));
        var C = (function () {
            function C() {
            }
            return C;
        }());
        return new C();
    };
    Object.defineProperty(A.prototype, "p", {
        get: function () {
            var E;
            (function (E) {
                E[E["A"] = 0] = "A";
                E[E["B"] = 1] = "B";
                E[E["C"] = 2] = "C";
            })(E || (E = {}));
            var C = (function () {
                function C() {
                }
                return C;
            }());
            return new C();
        },
        enumerable: true,
        configurable: true
    });
    return A;
}());
function f6() {
    var A = (function () {
        function A() {
        }
        return A;
    }());
    function g() {
        var B = (function (_super) {
            __extends(B, _super);
            function B() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return B;
        }(A));
        function h() {
            var C = (function (_super) {
                __extends(C, _super);
                function C() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                return C;
            }(B));
            var x = new C();
            x.a = "a";
            x.b = "b";
            x.c = "c";
            return x;
        }
        return h();
    }
    return g();
}
