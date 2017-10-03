//// [overloadsWithinClasses.ts]
class foo {
 
    static fnOverload( ) {}
 
    static fnOverload(foo: string){ } // error
 
}

class bar {
 
    static fnOverload( );
 
    static fnOverload(foo?: string){ } // no error
 
}

class X {
   public attr(name:string):string;
   public attr(name:string, value:string):X;
   public attr(first:any, second?:any):any {
   }
}


//// [overloadsWithinClasses.js]
var foo = (function () {
    function foo() {
    }
    foo.fnOverload = function () { };
    foo.fnOverload = function (foo) { }; // error
    return foo;
}());
var bar = (function () {
    function bar() {
    }
    bar.fnOverload = function (foo) { }; // no error
    return bar;
}());
var X = (function () {
    function X() {
    }
    X.prototype.attr = function (first, second) {
    };
    return X;
}());
