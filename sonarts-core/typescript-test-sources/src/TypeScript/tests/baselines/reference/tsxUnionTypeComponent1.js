//// [file.tsx]
import React = require('react');

interface ComponentProps {
    AnyComponent: React.StatelessComponent<any> | React.ComponentClass<any>;
}

class MyComponent extends React.Component<ComponentProps, {}> {
    render() {
        const { AnyComponent } = this.props;
        return (<AnyComponent />);
    }
}

// Stateless Component As Props
<MyComponent AnyComponent={() => <button>test</button>}/>

// Component Class as Props
class MyButtonComponent extends React.Component<{},{}> {
}

<MyComponent AnyComponent={MyButtonComponent} />



//// [file.js]
"use strict";
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
exports.__esModule = true;
var React = require("react");
var MyComponent = (function (_super) {
    __extends(MyComponent, _super);
    function MyComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MyComponent.prototype.render = function () {
        var AnyComponent = this.props.AnyComponent;
        return (React.createElement(AnyComponent, null));
    };
    return MyComponent;
}(React.Component));
// Stateless Component As Props
React.createElement(MyComponent, { AnyComponent: function () { return React.createElement("button", null, "test"); } });
// Component Class as Props
var MyButtonComponent = (function (_super) {
    __extends(MyButtonComponent, _super);
    function MyButtonComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MyButtonComponent;
}(React.Component));
React.createElement(MyComponent, { AnyComponent: MyButtonComponent });
