//// [cloduleStaticMembers.ts]
class Clod {
    private static x = 10;
    public static y = 10;
}
module Clod {
    var p = Clod.x;
    var q = x;

    var s = Clod.y;
    var t = y; 
}


//// [cloduleStaticMembers.js]
var Clod = (function () {
    function Clod() {
    }
    return Clod;
}());
Clod.x = 10;
Clod.y = 10;
(function (Clod) {
    var p = Clod.x;
    var q = x;
    var s = Clod.y;
    var t = y;
})(Clod || (Clod = {}));
