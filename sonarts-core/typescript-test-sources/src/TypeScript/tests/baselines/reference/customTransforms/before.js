// [source.js]
/*@before*/
function f1() { }
var c = (function () {
    function c() {
    }
    return c;
}());
(function () { });
var e;
(function (e) {
})(e || (e = {}));
// leading
/*@before*/
function f2() { } // trailing
