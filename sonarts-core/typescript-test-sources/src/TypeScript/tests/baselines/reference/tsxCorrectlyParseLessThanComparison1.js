//// [tsxCorrectlyParseLessThanComparison1.tsx]
declare module JSX {
    interface Element {
        div: string;
    }
}
declare namespace React {
    class Component<P, S> {
        constructor(props?: P, context?: any);
        props: P;
    }
}

export class ShortDetails extends React.Component<{ id: number }, {}> {
    public render(): JSX.Element {
        if (this.props.id < 1) {
            return (<div></div>);
        }
    }
}

//// [tsxCorrectlyParseLessThanComparison1.js]
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
var ShortDetails = (function (_super) {
    __extends(ShortDetails, _super);
    function ShortDetails() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ShortDetails.prototype.render = function () {
        if (this.props.id < 1) {
            return (React.createElement("div", null));
        }
    };
    return ShortDetails;
}(React.Component));
exports.ShortDetails = ShortDetails;
