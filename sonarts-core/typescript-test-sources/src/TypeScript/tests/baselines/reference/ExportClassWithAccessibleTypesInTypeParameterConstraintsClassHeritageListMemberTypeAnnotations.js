//// [ExportClassWithAccessibleTypesInTypeParameterConstraintsClassHeritageListMemberTypeAnnotations.ts]
module A {

    export class Point {
        x: number;
        y: number;
    }

    export var Origin: Point = { x: 0, y: 0 };

    export class Point3d extends Point {
        z: number;
    }

    export var Origin3d: Point3d = { x: 0, y: 0, z: 0 };

    export class Line<TPoint extends Point>{
        constructor(public start: TPoint, public end: TPoint) { }
    }
}


//// [ExportClassWithAccessibleTypesInTypeParameterConstraintsClassHeritageListMemberTypeAnnotations.js]
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
var A;
(function (A) {
    var Point = (function () {
        function Point() {
        }
        return Point;
    }());
    A.Point = Point;
    A.Origin = { x: 0, y: 0 };
    var Point3d = (function (_super) {
        __extends(Point3d, _super);
        function Point3d() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Point3d;
    }(Point));
    A.Point3d = Point3d;
    A.Origin3d = { x: 0, y: 0, z: 0 };
    var Line = (function () {
        function Line(start, end) {
            this.start = start;
            this.end = end;
        }
        return Line;
    }());
    A.Line = Line;
})(A || (A = {}));
