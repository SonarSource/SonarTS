//// [genericClasses3.ts]
class B<T> {
    a: T;
    b: T;
}

class C<T> extends B<T> {
    public x: T;
}

var v2: C <string>;

var y = v2.x; // should be 'string'
var u = v2.a; // should be 'string'

var z = v2.b;



//// [genericClasses3.js]
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
var B = (function () {
    function B() {
    }
    return B;
}());
var C = (function (_super) {
    __extends(C, _super);
    function C() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return C;
}(B));
var v2;
var y = v2.x; // should be 'string'
var u = v2.a; // should be 'string'
var z = v2.b;


//// [genericClasses3.d.ts]
declare class B<T> {
    a: T;
    b: T;
}
declare class C<T> extends B<T> {
    x: T;
}
declare var v2: C<string>;
declare var y: string;
declare var u: string;
declare var z: string;
