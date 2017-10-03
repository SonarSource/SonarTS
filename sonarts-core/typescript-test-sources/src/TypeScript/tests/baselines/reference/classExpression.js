//// [classExpression.ts]
var x = class C {
}

var y = {
    foo: class C2 {
    }
}

module M {
    var z = class C4 {
    }
}

//// [classExpression.js]
var x = (function () {
    function C() {
    }
    return C;
}());
var y = {
    foo: (function () {
        function C2() {
        }
        return C2;
    }())
};
var M;
(function (M) {
    var z = (function () {
        function C4() {
        }
        return C4;
    }());
})(M || (M = {}));
