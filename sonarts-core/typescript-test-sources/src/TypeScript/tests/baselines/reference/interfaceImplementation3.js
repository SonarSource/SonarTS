//// [interfaceImplementation3.ts]
interface I1 {
    iObj:{ };
    iNum:number;
    iAny:any;
    iFn():void;
}

class C4 implements I1 {
    public iObj:{ };
    public iNum:number;
    public iFn() { }
}




//// [interfaceImplementation3.js]
var C4 = (function () {
    function C4() {
    }
    C4.prototype.iFn = function () { };
    return C4;
}());
