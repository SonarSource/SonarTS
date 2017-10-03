//// [computedPropertyNamesContextualType2_ES5.ts]
interface I {
    [s: string]: (x: any) => number; // Doesn't get hit
    [s: number]: (x: string) => number;
}

var o: I = {
    [+"foo"](y) { return y.length; },
    [+"bar"]: y => y.length
}

//// [computedPropertyNamesContextualType2_ES5.js]
var o = (_a = {},
    _a[+"foo"] = function (y) { return y.length; },
    _a[+"bar"] = function (y) { return y.length; },
    _a);
var _a;
