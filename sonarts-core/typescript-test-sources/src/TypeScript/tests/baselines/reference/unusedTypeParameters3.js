//// [unusedTypeParameters3.ts]
class greeter<typeparameter1, typeparameter2, typeparameter3> {
    private x: typeparameter2;

    public function1() {
        this.x;
    }
}

//// [unusedTypeParameters3.js]
var greeter = (function () {
    function greeter() {
    }
    greeter.prototype.function1 = function () {
        this.x;
    };
    return greeter;
}());
