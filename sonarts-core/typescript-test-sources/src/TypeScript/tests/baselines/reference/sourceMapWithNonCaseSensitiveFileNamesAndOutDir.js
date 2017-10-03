//// [tests/cases/compiler/sourceMapWithNonCaseSensitiveFileNamesAndOutDir.ts] ////

//// [app.ts]
// Note in the out result we are using same folder name only different in casing
// Since this is non case sensitive, the relative paths should be just app.ts and app2.ts in the sourcemap
class c {
}

//// [app2.ts]
class d {
}

//// [app.js]
// Note in the out result we are using same folder name only different in casing
// Since this is non case sensitive, the relative paths should be just app.ts and app2.ts in the sourcemap
var c = (function () {
    function c() {
    }
    return c;
}());
//# sourceMappingURL=app.js.map//// [app2.js]
var d = (function () {
    function d() {
    }
    return d;
}());
//# sourceMappingURL=app2.js.map