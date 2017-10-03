//// [withStatementErrors.ts]
declare var ooo:any;

with (ooo.eee.oo.ah_ah.ting.tang.walla.walla) { // error
    bing = true; // no error
    bang = true; // no error
    
    function bar() {} // no error

    bar(); // no error

    class C {} // error   
    
    interface I {} // error
    
    module M {} // error
        
}


//// [withStatementErrors.js]
with (ooo.eee.oo.ah_ah.ting.tang.walla.walla) {
    bing = true; // no error
    bang = true; // no error
    function bar() { } // no error
    bar(); // no error
    var C = (function () {
        function C() {
        }
        return C;
    }()); // error   
}
