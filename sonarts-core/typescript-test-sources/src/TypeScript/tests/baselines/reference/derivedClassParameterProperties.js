//// [derivedClassParameterProperties.ts]
// ordering of super calls in derived constructors matters depending on other class contents

class Base {
    x: string;
}

class Derived extends Base {
    constructor(y: string) {
        var a = 1;
        super(); // ok
    }
}

class Derived2 extends Base {
    constructor(public y: string) {
        var a = 1;
        super(); // error
    }
}

class Derived3 extends Base {
    constructor(public y: string) {
        super(); // ok
        var a = 1;
    }
}

class Derived4 extends Base {
    a = 1;
    constructor(y: string) {
        var b = 2;
        super(); // error
    }
}

class Derived5 extends Base {
    a = 1;
    constructor(y: string) {
        super(); // ok
        var b = 2;
    }
}

class Derived6 extends Base {
    a: number;
    constructor(y: string) {
        this.a = 1;
        var b = 2;
        super(); // error: "super" has to be called before "this" accessing
    }
}

class Derived7 extends Base {
    a = 1;
    b: number;
    constructor(y: string) {
        this.a = 3;
        this.b = 3;
        super(); // error
    }
}

class Derived8 extends Base {
    a = 1;
    b: number;
    constructor(y: string) {
        super(); // ok
        this.a = 3;
        this.b = 3;        
    }
}

// generic cases of Derived7 and Derived8
class Base2<T> { x: T; }

class Derived9<T> extends Base2<T> {
    a = 1;
    b: number;
    constructor(y: string) {
        this.a = 3;
        this.b = 3;
        super(); // error
    }
}

class Derived10<T> extends Base2<T> {
    a = 1;
    b: number;
    constructor(y: string) {
        super(); // ok
        this.a = 3;
        this.b = 3;
    }
}

//// [derivedClassParameterProperties.js]
// ordering of super calls in derived constructors matters depending on other class contents
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
    function Derived(y) {
        var _this = this;
        var a = 1;
        _this = _super.call(this) || this; // ok
        return _this;
    }
    return Derived;
}(Base));
var Derived2 = (function (_super) {
    __extends(Derived2, _super);
    function Derived2(y) {
        var _this = this;
        _this.y = y;
        var a = 1;
        _this = _super.call(this) || this; // error
        return _this;
    }
    return Derived2;
}(Base));
var Derived3 = (function (_super) {
    __extends(Derived3, _super);
    function Derived3(y) {
        var _this = _super.call(this) || this;
        _this.y = y;
        var a = 1;
        return _this;
    }
    return Derived3;
}(Base));
var Derived4 = (function (_super) {
    __extends(Derived4, _super);
    function Derived4(y) {
        var _this = this;
        _this.a = 1;
        var b = 2;
        _this = _super.call(this) || this; // error
        return _this;
    }
    return Derived4;
}(Base));
var Derived5 = (function (_super) {
    __extends(Derived5, _super);
    function Derived5(y) {
        var _this = _super.call(this) || this;
        _this.a = 1;
        var b = 2;
        return _this;
    }
    return Derived5;
}(Base));
var Derived6 = (function (_super) {
    __extends(Derived6, _super);
    function Derived6(y) {
        var _this = this;
        _this.a = 1;
        var b = 2;
        _this = _super.call(this) || this; // error: "super" has to be called before "this" accessing
        return _this;
    }
    return Derived6;
}(Base));
var Derived7 = (function (_super) {
    __extends(Derived7, _super);
    function Derived7(y) {
        var _this = this;
        _this.a = 1;
        _this.a = 3;
        _this.b = 3;
        _this = _super.call(this) || this; // error
        return _this;
    }
    return Derived7;
}(Base));
var Derived8 = (function (_super) {
    __extends(Derived8, _super);
    function Derived8(y) {
        var _this = _super.call(this) || this;
        _this.a = 1;
        _this.a = 3;
        _this.b = 3;
        return _this;
    }
    return Derived8;
}(Base));
// generic cases of Derived7 and Derived8
var Base2 = (function () {
    function Base2() {
    }
    return Base2;
}());
var Derived9 = (function (_super) {
    __extends(Derived9, _super);
    function Derived9(y) {
        var _this = this;
        _this.a = 1;
        _this.a = 3;
        _this.b = 3;
        _this = _super.call(this) || this; // error
        return _this;
    }
    return Derived9;
}(Base2));
var Derived10 = (function (_super) {
    __extends(Derived10, _super);
    function Derived10(y) {
        var _this = _super.call(this) || this;
        _this.a = 1;
        _this.a = 3;
        _this.b = 3;
        return _this;
    }
    return Derived10;
}(Base2));
