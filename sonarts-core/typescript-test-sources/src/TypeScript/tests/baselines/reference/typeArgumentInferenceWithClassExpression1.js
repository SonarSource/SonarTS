//// [typeArgumentInferenceWithClassExpression1.ts]
function foo<T>(x = class { static prop: T }): T {
    return undefined;
}

foo(class { static prop = "hello" }).length;

//// [typeArgumentInferenceWithClassExpression1.js]
function foo(x) {
    if (x === void 0) { x = (function () {
        function class_1() {
        }
        return class_1;
    }()); }
    return undefined;
}
foo((_a = (function () {
        function class_2() {
        }
        return class_2;
    }()),
    _a.prop = "hello",
    _a)).length;
var _a;
