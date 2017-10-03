//// [recursivelySpecializedConstructorDeclaration.ts]
module MsPortal.Controls.Base.ItemList {

    export interface Interface<TValue> {
        // Removing this line fixes the constructor of ItemValue
        options: ViewModel<TValue>;
    }    

    export class ItemValue<T> {
        constructor(value: T) {
        }
    }    
 
    export class ViewModel<TValue> extends ItemValue<TValue> {
    }
}

// Generates:
/*
declare module MsPortal.Controls.Base.ItemList {
    interface Interface<TValue> {
        options: ViewModel<TValue>;
    }
    class ItemValue<T> {
        constructor(value: T);
    }
    class ViewModel<TValue> extends ItemValue<TValue> {
    }
}
*/

//// [recursivelySpecializedConstructorDeclaration.js]
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
var MsPortal;
(function (MsPortal) {
    var Controls;
    (function (Controls) {
        var Base;
        (function (Base) {
            var ItemList;
            (function (ItemList) {
                var ItemValue = (function () {
                    function ItemValue(value) {
                    }
                    return ItemValue;
                }());
                ItemList.ItemValue = ItemValue;
                var ViewModel = (function (_super) {
                    __extends(ViewModel, _super);
                    function ViewModel() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    return ViewModel;
                }(ItemValue));
                ItemList.ViewModel = ViewModel;
            })(ItemList = Base.ItemList || (Base.ItemList = {}));
        })(Base = Controls.Base || (Controls.Base = {}));
    })(Controls = MsPortal.Controls || (MsPortal.Controls = {}));
})(MsPortal || (MsPortal = {}));
// Generates:
/*
declare module MsPortal.Controls.Base.ItemList {
    interface Interface<TValue> {
        options: ViewModel<TValue>;
    }
    class ItemValue<T> {
        constructor(value: T);
    }
    class ViewModel<TValue> extends ItemValue<TValue> {
    }
}
*/ 
