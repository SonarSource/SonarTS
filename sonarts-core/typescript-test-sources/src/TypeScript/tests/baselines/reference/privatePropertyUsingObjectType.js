//// [privatePropertyUsingObjectType.ts]
export class FilterManager {
    private _filterProviders: { index: IFilterProvider; };
    private _filterProviders2: { [index: number]: IFilterProvider; };
    private _filterProviders3: { (index: number): IFilterProvider; };
    private _filterProviders4: (index: number) => IFilterProvider;
}
export interface IFilterProvider {
}


//// [privatePropertyUsingObjectType.js]
define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var FilterManager = (function () {
        function FilterManager() {
        }
        return FilterManager;
    }());
    exports.FilterManager = FilterManager;
});
