//// [explicitAnyAfterSpreadNoImplicitAnyError.ts]
({ a: [], ...(null as any) });
let x: any;


//// [explicitAnyAfterSpreadNoImplicitAnyError.js]
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
(__assign({ a: [] }, null));
var x;
