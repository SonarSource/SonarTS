//// [arrayAssignmentTest2.ts]
interface I1 {
	IM1():void[];
}

class C1 implements I1 { 
	IM1():void[] {return null;}
	C1M1():C1[] {return null;}
 }
class C2 extends C1 {
	C2M1():C2[] { return null;}
}

class C3 {
	CM3M1() { return 3;}
}


/*

This behaves unexpectedly with the following types:

Type 1 of any[]:

* Type 2 of the following throws an error but shouldn't: () => void[], SomeClass[], and {one: 1}[].

* Type 2 of the following doesn't throw an error but should: {one: 1}, new() => SomeClass, SomeClass.

*/
var a1 : any = null;
var c1 : C1 = new C1();
var i1 : I1 = c1;
var c2 : C2 = new C2();
var c3 : C3 = new C3();
var o1 = {one : 1};
var f1 = function () { return new C1();}

var arr_any: any[] = [];
var arr_i1: I1[] = [];
var arr_c1: C1[] = [];
var arr_c2: C2[] = [];
var arr_i1_2: I1[] = [];
var arr_c1_2: C1[] = [];
var arr_c2_2: C2[] = [];
var arr_c3: C3[] = [];

// "clean up error" occurs at this point
arr_c3 = arr_c2_2; // should be an error - is
arr_c3 = arr_c1_2; // should be an error - is
arr_c3 = arr_i1_2; // should be an error - is

arr_any = f1; // should be an error - is
arr_any = function () { return null;} // should be an error - is
arr_any = o1; // should be an error - is
arr_any = a1; // should be ok - is
arr_any = c1; // should be an error - is
arr_any = c2; // should be an error - is
arr_any = c3; // should be an error - is
arr_any = i1; // should be an error - is


//// [arrayAssignmentTest2.js]
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
var C1 = (function () {
    function C1() {
    }
    C1.prototype.IM1 = function () { return null; };
    C1.prototype.C1M1 = function () { return null; };
    return C1;
}());
var C2 = (function (_super) {
    __extends(C2, _super);
    function C2() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    C2.prototype.C2M1 = function () { return null; };
    return C2;
}(C1));
var C3 = (function () {
    function C3() {
    }
    C3.prototype.CM3M1 = function () { return 3; };
    return C3;
}());
/*

This behaves unexpectedly with the following types:

Type 1 of any[]:

* Type 2 of the following throws an error but shouldn't: () => void[], SomeClass[], and {one: 1}[].

* Type 2 of the following doesn't throw an error but should: {one: 1}, new() => SomeClass, SomeClass.

*/
var a1 = null;
var c1 = new C1();
var i1 = c1;
var c2 = new C2();
var c3 = new C3();
var o1 = { one: 1 };
var f1 = function () { return new C1(); };
var arr_any = [];
var arr_i1 = [];
var arr_c1 = [];
var arr_c2 = [];
var arr_i1_2 = [];
var arr_c1_2 = [];
var arr_c2_2 = [];
var arr_c3 = [];
// "clean up error" occurs at this point
arr_c3 = arr_c2_2; // should be an error - is
arr_c3 = arr_c1_2; // should be an error - is
arr_c3 = arr_i1_2; // should be an error - is
arr_any = f1; // should be an error - is
arr_any = function () { return null; }; // should be an error - is
arr_any = o1; // should be an error - is
arr_any = a1; // should be ok - is
arr_any = c1; // should be an error - is
arr_any = c2; // should be an error - is
arr_any = c3; // should be an error - is
arr_any = i1; // should be an error - is
