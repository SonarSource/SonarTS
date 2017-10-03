//// [nestedClassDeclaration.ts]
// nested classes are not allowed

class C {
    x: string;
    class C2 {
    }
}

function foo() {
    class C3 {
    }
}

var x = {
    class C4 {
    }
}


//// [nestedClassDeclaration.js]
// nested classes are not allowed
var C = (function () {
    function C() {
    }
    return C;
}());
var C2 = (function () {
    function C2() {
    }
    return C2;
}());
function foo() {
    var C3 = (function () {
        function C3() {
        }
        return C3;
    }());
}
var x = {
    "class": C4
}, _a = void 0;
