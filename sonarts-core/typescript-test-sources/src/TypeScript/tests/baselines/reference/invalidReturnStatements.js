//// [invalidReturnStatements.ts]
// all the following should be error
function fn1(): number {  }
function fn2(): string { }
function fn3(): boolean { }
function fn4(): Date {  }
function fn7(): any {  } // should be valid: any includes void

interface I { id: number }
class C implements I {
    id: number;
    dispose() {}
}
class D extends C {
    name: string;
}
function fn10(): D { return { id: 12 }; } 

function fn11(): D { return new C(); }



//// [invalidReturnStatements.js]
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
// all the following should be error
function fn1() { }
function fn2() { }
function fn3() { }
function fn4() { }
function fn7() { } // should be valid: any includes void
var C = (function () {
    function C() {
    }
    C.prototype.dispose = function () { };
    return C;
}());
var D = (function (_super) {
    __extends(D, _super);
    function D() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return D;
}(C));
function fn10() { return { id: 12 }; }
function fn11() { return new C(); }
