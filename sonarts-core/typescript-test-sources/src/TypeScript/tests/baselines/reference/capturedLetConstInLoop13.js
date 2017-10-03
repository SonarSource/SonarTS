//// [capturedLetConstInLoop13.ts]
class Main {

    constructor() {
        this.register("a", "b", "c");
    }

    private register(...names: string[]): void {
        for (let name of names) {

            this.bar({
                [name + ".a"]: () => { this.foo(name); },
            });
        }
    }

    private bar(a: any): void { }

    private foo(name: string): void { }

}

new Main();

//// [capturedLetConstInLoop13.js]
var Main = (function () {
    function Main() {
        this.register("a", "b", "c");
    }
    Main.prototype.register = function () {
        var _this = this;
        var names = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            names[_i] = arguments[_i];
        }
        var _loop_1 = function (name) {
            this_1.bar((_a = {},
                _a[name + ".a"] = function () { _this.foo(name); },
                _a));
            var _a;
        };
        var this_1 = this;
        for (var _a = 0, names_1 = names; _a < names_1.length; _a++) {
            var name = names_1[_a];
            _loop_1(name);
        }
    };
    Main.prototype.bar = function (a) { };
    Main.prototype.foo = function (name) { };
    return Main;
}());
new Main();
