//// [interfaceDeclaration2.ts]
interface I1 { }
module I1 { }

interface I2 { }
class I2 { }

interface I3 { }
function I3() { }

interface I4 { }
var I4:number;



//// [interfaceDeclaration2.js]
var I2 = (function () {
    function I2() {
    }
    return I2;
}());
function I3() { }
var I4;
