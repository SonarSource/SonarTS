//// [classWithEmptyBody.ts]
class C {
}

var c: C;
var o: {} = c;
c = 1;
c = { foo: '' }
c = () => { }

class D {
    constructor() {
        return 1;
    }
}

var d: D;
var o: {} = d;
d = 1;
d = { foo: '' }
d = () => { }

//// [classWithEmptyBody.js]
var C = (function () {
    function C() {
    }
    return C;
}());
var c;
var o = c;
c = 1;
c = { foo: '' };
c = function () { };
var D = (function () {
    function D() {
        return 1;
    }
    return D;
}());
var d;
var o = d;
d = 1;
d = { foo: '' };
d = function () { };
