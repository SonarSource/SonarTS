//// [interfaceClassMerging2.ts]
interface Foo {
    interfaceFooMethod(): this;
    interfaceFooProperty: this;
}

class Foo {
    classFooProperty: this;

    classFooMethod(): this {
        return this;
    }
}


interface Bar {
    interfaceBarMethod(): this;
    interfaceBarProperty: this;
}

class Bar extends Foo {
    classBarProperty: this;

    classBarMethod(): this {
        return this;
    }
}


var bar = new Bar();
bar.interfaceBarMethod().interfaceFooMethod().classBarMethod().classFooMethod();


var foo = new Foo();

foo = bar;


//// [interfaceClassMerging2.js]
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
    Foo.prototype.classFooMethod = function () {
        return this;
    };
    return Foo;
}());
var Bar = (function (_super) {
    __extends(Bar, _super);
    function Bar() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Bar.prototype.classBarMethod = function () {
        return this;
    };
    return Bar;
}(Foo));
var bar = new Bar();
bar.interfaceBarMethod().interfaceFooMethod().classBarMethod().classFooMethod();
var foo = new Foo();
foo = bar;
