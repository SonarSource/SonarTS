//// [sourceMapValidationClassWithDefaultConstructor.ts]
class Greeter {
    public a = 10;
    public nameA = "Ten";
}

//// [sourceMapValidationClassWithDefaultConstructor.js]
var Greeter = (function () {
    function Greeter() {
        this.a = 10;
        this.nameA = "Ten";
    }
    return Greeter;
}());
//# sourceMappingURL=sourceMapValidationClassWithDefaultConstructor.js.map