//// [taggedTemplateStringsWithOverloadResolution1.ts]
function foo(strs: TemplateStringsArray): number;
function foo(strs: TemplateStringsArray, x: number): string;
function foo(strs: TemplateStringsArray, x: number, y: number): boolean;
function foo(strs: TemplateStringsArray, x: number, y: string): {};
function foo(...stuff: any[]): any {
    return undefined;
}

var a = foo([]);             // number
var b = foo([], 1);          // string
var c = foo([], 1, 2);       // boolean
var d = foo([], 1, true);    // boolean (with error)
var e = foo([], 1, "2");     // {}
var f = foo([], 1, 2, 3);    // any (with error)

var u = foo ``;              // number
var v = foo `${1}`;          // string
var w = foo `${1}${2}`;      // boolean
var x = foo `${1}${true}`;   // boolean (with error)
var y = foo `${1}${"2"}`;    // {}
var z = foo `${1}${2}${3}`;  // any (with error)


//// [taggedTemplateStringsWithOverloadResolution1.js]
function foo() {
    var stuff = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        stuff[_i] = arguments[_i];
    }
    return undefined;
}
var a = foo([]); // number
var b = foo([], 1); // string
var c = foo([], 1, 2); // boolean
var d = foo([], 1, true); // boolean (with error)
var e = foo([], 1, "2"); // {}
var f = foo([], 1, 2, 3); // any (with error)
var u = (_a = [""], _a.raw = [""], foo(_a)); // number
var v = (_b = ["", ""], _b.raw = ["", ""], foo(_b, 1)); // string
var w = (_c = ["", "", ""], _c.raw = ["", "", ""], foo(_c, 1, 2)); // boolean
var x = (_d = ["", "", ""], _d.raw = ["", "", ""], foo(_d, 1, true)); // boolean (with error)
var y = (_e = ["", "", ""], _e.raw = ["", "", ""], foo(_e, 1, "2")); // {}
var z = (_f = ["", "", "", ""], _f.raw = ["", "", "", ""], foo(_f, 1, 2, 3)); // any (with error)
var _a, _b, _c, _d, _e, _f;
