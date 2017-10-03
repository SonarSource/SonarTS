//// [declFileWithExtendsClauseThatHasItsContainerNameConflict.ts]
declare module A.B.C {
    class B {
    }
}

module A.B {
    export class EventManager {
        id: number;

    }
}

module A.B.C {
    export class ContextMenu extends EventManager {
        name: string;
    }
}

//// [declFileWithExtendsClauseThatHasItsContainerNameConflict.js]
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
    var B;
    (function (B) {
        var EventManager = (function () {
            function EventManager() {
            }
            return EventManager;
        }());
        B.EventManager = EventManager;
    })(B = A.B || (A.B = {}));
})(A || (A = {}));
(function (A) {
    var B;
    (function (B) {
        var C;
        (function (C) {
            var ContextMenu = (function (_super) {
                __extends(ContextMenu, _super);
                function ContextMenu() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                return ContextMenu;
            }(B.EventManager));
            C.ContextMenu = ContextMenu;
        })(C = B.C || (B.C = {}));
    })(B = A.B || (A.B = {}));
})(A || (A = {}));


//// [declFileWithExtendsClauseThatHasItsContainerNameConflict.d.ts]
declare module A.B.C {
    class B {
    }
}
declare module A.B {
    class EventManager {
        id: number;
    }
}
declare module A.B.C {
    class ContextMenu extends EventManager {
        name: string;
    }
}
