//// [numericClassMembers1.ts]
class C234 {
  0 = 1; 
  0.0 = 2;
}
 
class C235 { 
  0.0 = 1;
 '0' = 2;
}

class C236 {
    '0.0' = 1;
    '0' = 2;
}


//// [numericClassMembers1.js]
var C234 = (function () {
    function C234() {
        this[0] = 1;
        this[0.0] = 2;
    }
    return C234;
}());
var C235 = (function () {
    function C235() {
        this[0.0] = 1;
        this['0'] = 2;
    }
    return C235;
}());
var C236 = (function () {
    function C236() {
        this['0.0'] = 1;
        this['0'] = 2;
    }
    return C236;
}());
