//// [contextualTyping15.ts]
class foo { public bar: { (): number; (i: number): number; } = function() { return 1 }; }

//// [contextualTyping15.js]
var foo = (function () {
    function foo() {
        this.bar = function () { return 1; };
    }
    return foo;
}());
