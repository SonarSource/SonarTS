//// [computedPropertyNamesContextualType10_ES5.ts]
interface I {
    [s: number]: boolean;
}

var o: I = {
    [+"foo"]: "",
    [+"bar"]: 0
}

//// [computedPropertyNamesContextualType10_ES5.js]
var o = (_a = {},
    _a[+"foo"] = "",
    _a[+"bar"] = 0,
    _a);
var _a;
