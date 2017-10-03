//// [jsxInExtendsClause.tsx]
// https://github.com/Microsoft/TypeScript/issues/13157
declare namespace React {
  interface ComponentClass<P> { new (): Component<P, {}>; }
  class Component<A, B> {}
}
declare function createComponentClass<P>(factory: () => React.ComponentClass<P>): React.ComponentClass<P>;
class Foo extends createComponentClass(() => class extends React.Component<{}, {}> {
  render() {
    return <span>Hello, world!</span>;
  }
}) {}

//// [jsxInExtendsClause.js]
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
var Foo = (function (_super) {
    __extends(Foo, _super);
    function Foo() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Foo;
}(createComponentClass(function () { return (function (_super) {
    __extends(class_1, _super);
    function class_1() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    class_1.prototype.render = function () {
        return React.createElement("span", null, "Hello, world!");
    };
    return class_1;
}(React.Component)); })));
