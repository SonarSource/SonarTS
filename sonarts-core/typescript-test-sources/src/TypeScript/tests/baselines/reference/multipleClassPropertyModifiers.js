//// [multipleClassPropertyModifiers.ts]
class C {
    public static p1;
    static public p2;
    private static p3;
    static private p4;
}

//// [multipleClassPropertyModifiers.js]
var C = (function () {
    function C() {
    }
    return C;
}());
