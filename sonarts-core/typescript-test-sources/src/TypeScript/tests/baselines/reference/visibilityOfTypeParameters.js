//// [visibilityOfTypeParameters.ts]
export class MyClass {
    protected myMethod<T>(val: T): T {
        return val;
    }
}

//// [visibilityOfTypeParameters.js]
"use strict";
exports.__esModule = true;
var MyClass = (function () {
    function MyClass() {
    }
    MyClass.prototype.myMethod = function (val) {
        return val;
    };
    return MyClass;
}());
exports.MyClass = MyClass;


//// [visibilityOfTypeParameters.d.ts]
export declare class MyClass {
    protected myMethod<T>(val: T): T;
}
