//// [emptyAssignmentPatterns02_ES5iterable.ts]
var a: any;
let x, y, z, a1, a2, a3;

({} = { x, y, z } = a);
([] = [ a1, a2, a3] = a);

//// [emptyAssignmentPatterns02_ES5iterable.js]
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var a;
var x, y, z, a1, a2, a3;
(x = a.x, y = a.y, z = a.z);
(_a = __read(a, 3), a1 = _a[0], a2 = _a[1], a3 = _a[2]);
var _a;


//// [emptyAssignmentPatterns02_ES5iterable.d.ts]
declare var a: any;
declare let x: any, y: any, z: any, a1: any, a2: any, a3: any;
