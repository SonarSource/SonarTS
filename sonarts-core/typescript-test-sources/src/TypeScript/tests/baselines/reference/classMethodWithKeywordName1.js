//// [classMethodWithKeywordName1.ts]
class C {
 static try() {}
}

//// [classMethodWithKeywordName1.js]
var C = (function () {
    function C() {
    }
    C["try"] = function () { };
    return C;
}());
