//// [genericMergedDeclarationUsingTypeParameter2.ts]
class foo<T> { constructor(x: T) { } }
module foo {
    export var x: T;
    var y = <T>1;
}


//// [genericMergedDeclarationUsingTypeParameter2.js]
var foo = (function () {
    function foo(x) {
    }
    return foo;
}());
(function (foo) {
    var y = 1;
})(foo || (foo = {}));
