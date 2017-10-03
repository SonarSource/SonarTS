//// [underscoreMapFirst.ts]
declare module _ {
    interface Collection<T> { }
    interface List<T> extends Collection<T> {
        [index: number]: T;
        length: number;
    }

    interface ListIterator<T, TResult> {
        (value: T, index: number, list: T[]): TResult;
    }

    interface Dictionary<T> extends Collection<T> {
        [index: string]: T;
    }
    export function pluck<T extends {}>(
        list: Collection<T>,
        propertyName: string): any[];

    export function map<T, TResult>(
        list: List<T>,
        iterator: ListIterator<T, TResult>,
        context?: any): TResult[];

    export function first<T>(array: List<T>): T;
}

declare class View {
    model: any;
}

interface IData {
    series: ISeries[];
}

interface ISeries {
    items: any[];
    key: string;
}

class MyView extends View {
    public getDataSeries(): ISeries[] {
        var data: IData[] = this.model.get("data");
        var allSeries: ISeries[][] = _.pluck(data, "series");

        return _.map(allSeries, _.first);
    }
}


//// [underscoreMapFirst.js]
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
var MyView = (function (_super) {
    __extends(MyView, _super);
    function MyView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MyView.prototype.getDataSeries = function () {
        var data = this.model.get("data");
        var allSeries = _.pluck(data, "series");
        return _.map(allSeries, _.first);
    };
    return MyView;
}(View));
