//// [circularTypeofWithFunctionModule.ts]
// Repro from #6072

class Foo {}

function maker (value: string): typeof maker.Bar {
    return maker.Bar;
}

namespace maker {
    export class Bar extends Foo {}
}


//// [circularTypeofWithFunctionModule.js]
// Repro from #6072
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
var Foo = (function () {
    function Foo() {
    }
    return Foo;
}());
function maker(value) {
    return maker.Bar;
}
(function (maker) {
    var Bar = (function (_super) {
        __extends(Bar, _super);
        function Bar() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Bar;
    }(Foo));
    maker.Bar = Bar;
})(maker || (maker = {}));
