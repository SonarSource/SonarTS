//// [restElementWithAssignmentPattern5.ts]
var s: string, s2: string;
[...[s, s2]] = ["", ""];

//// [restElementWithAssignmentPattern5.js]
var s, s2;
_a = ["", ""].slice(0), s = _a[0], s2 = _a[1];
var _a;
