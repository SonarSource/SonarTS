//// [modifierOnClassDeclarationMemberInFunction.ts]
function f() {
    class C {
        public baz = 1;
        static foo() { }
        public bar() { }
    }
}

//// [modifierOnClassDeclarationMemberInFunction.js]
function f() {
    var C = (function () {
        function C() {
            this.baz = 1;
        }
        C.foo = function () { };
        C.prototype.bar = function () { };
        return C;
    }());
}


//// [modifierOnClassDeclarationMemberInFunction.d.ts]
declare function f(): void;
