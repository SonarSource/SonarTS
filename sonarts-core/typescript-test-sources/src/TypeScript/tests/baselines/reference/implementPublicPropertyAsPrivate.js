//// [implementPublicPropertyAsPrivate.ts]
interface I {
    x: number;
}
class C implements I {
    private x = 0; // should raise error at class decl
}

//// [implementPublicPropertyAsPrivate.js]
var C = (function () {
    function C() {
        this.x = 0; // should raise error at class decl
    }
    return C;
}());
