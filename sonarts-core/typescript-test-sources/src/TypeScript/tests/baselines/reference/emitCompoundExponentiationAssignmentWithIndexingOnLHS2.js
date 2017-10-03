//// [emitCompoundExponentiationAssignmentWithIndexingOnLHS2.ts]
var globalCounter = 0;
function foo() {
    globalCounter += 1;
    return { 0: 2 };
}
foo()[0] **= foo()[0];
var result_foo1 = foo()[0] **= foo()[0];
foo()[0] **= foo()[0] **= 2;
var result_foo2 = foo()[0] **= foo()[0] **= 2;
foo()[0] **= foo()[0] ** 2;
var result_foo3 = foo()[0] **= foo()[0] ** 2;

//// [emitCompoundExponentiationAssignmentWithIndexingOnLHS2.js]
var globalCounter = 0;
function foo() {
    globalCounter += 1;
    return { 0: 2 };
}
(_a = foo())[_b = 0] = Math.pow(_a[_b], foo()[0]);
var result_foo1 = (_c = foo())[_d = 0] = Math.pow(_c[_d], foo()[0]);
(_e = foo())[_f = 0] = Math.pow(_e[_f], (_g = foo())[_h = 0] = Math.pow(_g[_h], 2));
var result_foo2 = (_j = foo())[_k = 0] = Math.pow(_j[_k], (_l = foo())[_m = 0] = Math.pow(_l[_m], 2));
(_o = foo())[_p = 0] = Math.pow(_o[_p], Math.pow(foo()[0], 2));
var result_foo3 = (_q = foo())[_r = 0] = Math.pow(_q[_r], Math.pow(foo()[0], 2));
var _a, _b, _c, _d, _g, _h, _e, _f, _l, _m, _j, _k, _o, _p, _q, _r;
