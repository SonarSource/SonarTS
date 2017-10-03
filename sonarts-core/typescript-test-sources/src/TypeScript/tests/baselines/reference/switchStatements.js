//// [switchStatements.ts]
module M {
    export function fn(x: number) {
        return '';
    }
}

var x: any;
switch (x) {
    case '':
    case 12:
    case true:
    case null:
    case undefined:
    case new Date(12):
    case new Object():
    case /[a-z]/:
    case[]:
    case {}:
    case { id: 12 }:
    case['a']:
    case typeof x:
    case typeof M:
    case M.fn(1):
    case <T>(x: number) => '':
    case (<T>(x: number) => '')(2):
    default:
}

// basic assignable check, rest covered in tests for 'assignement compatibility'
class C { id: number; }
class D extends C { name: string }

switch (new C()) {
    case new D():
    case { id: 12, name: '' }:
    case new C():
}

switch ('') { }
switch (12) { }
switch (true) { }
switch (null) { }
switch (undefined) { }
switch (new Date(12)) { }
switch (new Object()) { }
switch (/[a-z]/) { }
switch ([]) { }
switch ({}) { }
switch ({ id: 12 }) { }
switch (['a']) { }
switch (<T>(x: number) => '') { }
switch ((<T>(x: T) => '')(1)) { }




//// [switchStatements.js]
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var M;
(function (M) {
    function fn(x) {
        return '';
    }
    M.fn = fn;
})(M || (M = {}));
var x;
switch (x) {
    case '':
    case 12:
    case true:
    case null:
    case undefined:
    case new Date(12):
    case new Object():
    case /[a-z]/:
    case []:
    case {}:
    case { id: 12 }:
    case ['a']:
    case typeof x:
    case typeof M:
    case M.fn(1):
    case function (x) { return ''; }:
    case (function (x) { return ''; })(2):
    default:
}
// basic assignable check, rest covered in tests for 'assignement compatibility'
var C = (function () {
    function C() {
    }
    return C;
}());
var D = (function (_super) {
    __extends(D, _super);
    function D() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return D;
}(C));
switch (new C()) {
    case new D():
    case { id: 12, name: '' }:
    case new C():
}
switch ('') {
}
switch (12) {
}
switch (true) {
}
switch (null) {
}
switch (undefined) {
}
switch (new Date(12)) {
}
switch (new Object()) {
}
switch (/[a-z]/) {
}
switch ([]) {
}
switch ({}) {
}
switch ({ id: 12 }) {
}
switch (['a']) {
}
switch (function (x) { return ''; }) {
}
switch ((function (x) { return ''; })(1)) {
}
