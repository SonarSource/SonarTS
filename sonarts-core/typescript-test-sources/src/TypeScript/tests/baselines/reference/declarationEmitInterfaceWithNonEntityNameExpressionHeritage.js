//// [declarationEmitInterfaceWithNonEntityNameExpressionHeritage.ts]
class A { }
interface Class extends (typeof A) { }

//// [declarationEmitInterfaceWithNonEntityNameExpressionHeritage.js]
var A = (function () {
    function A() {
    }
    return A;
}());


//// [declarationEmitInterfaceWithNonEntityNameExpressionHeritage.d.ts]
declare class A {
}
interface Class {
}
