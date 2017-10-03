//// [giant.ts]
/*
    Prefixes
    p -> public
    r -> private
    i -> import
    e -> export
    a -> ambient
    t -> static
    s -> set
    g -> get

    MAX DEPTH 3 LEVELS
*/
var V;
function F() { };
class C {
    constructor () { }
    public pV;
    private rV;
    public pF() { }
    private rF() { }
    public pgF() { }
    public get pgF()
    public psF(param:any) { }
    public set psF(param:any)
    private rgF() { }
    private get rgF()
    private rsF(param:any) { }
    private set rsF(param:any)
    static tV;
    static tF() { }
    static tsF(param:any) { }
    static set tsF(param:any)
    static tgF() { }
    static get tgF()
}
interface I {
    //Call Signature
    ();
    (): number;
    (p);
    (p1: string);
    (p2?: string);
    (...p3: any[]);
    (p4: string, p5?: string);
    (p6: string, ...p7: any[]);
    //(p8?: string, ...p9: any[]);
    //(p10:string, p8?: string, ...p9: any[]);
    
    //Construct Signature
    new ();
    new (): number;
    new (p: string);
    new (p2?: string);
    new (...p3: any[]);
    new (p4: string, p5?: string);
    new (p6: string, ...p7: any[]);

    //Index Signature
    [p];
    [p1: string];
    [p2: string, p3: number];

    //Property Signature
    p;
    p1?;
    p2?: string;
    
    //Function Signature
    p3();
    p4? ();
    p5? (): void;
    p6(pa1): void;
    p7(pa1, pa2): void;
    p7? (pa1, pa2): void;
}
module M {
    var V;
    function F() { };
    class C {
        constructor () { }
        public pV;
        private rV;
        public pF() { }
        private rF() { }
        public pgF() { }
        public get pgF()
        public psF(param:any) { }
        public set psF(param:any)
        private rgF() { }
        private get rgF()
        private rsF(param:any) { }
        private set rsF(param:any)
        static tV;
        static tF() { }
        static tsF(param:any) { }
        static set tsF(param:any)
        static tgF() { }
        static get tgF()
    }
    interface I {
        //Call Signature
        ();
        (): number;
        (p);
        (p1: string);
        (p2?: string);
        (...p3: any[]);
        (p4: string, p5?: string);
        (p6: string, ...p7: any[]);
        //(p8?: string, ...p9: any[]);
        //(p10:string, p8?: string, ...p9: any[]);
    
        //Construct Signature
        new ();
        new (): number;
        new (p: string);
        new (p2?: string);
        new (...p3: any[]);
        new (p4: string, p5?: string);
        new (p6: string, ...p7: any[]);

        //Index Signature
        [p];
        [p1: string];
        [p2: string, p3: number];

        //Property Signature
        p;
        p1?;
        p2?: string;
    
        //Function Signature
        p3();
        p4? ();
        p5? (): void;
        p6(pa1): void;
        p7(pa1, pa2): void;
        p7? (pa1, pa2): void;
    }
    module M {
        var V;
        function F() { };
        class C { };
        interface I { };
        module M { };
        export var eV;
        export function eF() { };
        export class eC { };
        export interface eI { };
        export module eM { };
        export declare var eaV;
        export declare function eaF() { };
        export declare class eaC { };
        export declare module eaM { };
    }
    export var eV;
    export function eF() { };
    export class eC {
        constructor () { }
        public pV;
        private rV;
        public pF() { }
        private rF() { }
        public pgF() { }
        public get pgF()
        public psF(param:any) { }
        public set psF(param:any)
        private rgF() { }
        private get rgF()
        private rsF(param:any) { }
        private set rsF(param:any)
        static tV;
        static tF() { }
        static tsF(param:any) { }
        static set tsF(param:any)
        static tgF() { }
        static get tgF()
    }
    export interface eI {
        //Call Signature
        ();
        (): number;
        (p);
        (p1: string);
        (p2?: string);
        (...p3: any[]);
        (p4: string, p5?: string);
        (p6: string, ...p7: any[]);
        //(p8?: string, ...p9: any[]);
        //(p10:string, p8?: string, ...p9: any[]);
    
        //Construct Signature
        new ();
        new (): number;
        new (p: string);
        new (p2?: string);
        new (...p3: any[]);
        new (p4: string, p5?: string);
        new (p6: string, ...p7: any[]);

        //Index Signature
        [p];
        [p1: string];
        [p2: string, p3: number];

        //Property Signature
        p;
        p1?;
        p2?: string;
    
        //Function Signature
        p3();
        p4? ();
        p5? (): void;
        p6(pa1): void;
        p7(pa1, pa2): void;
        p7? (pa1, pa2): void;
    }
    export module eM {
        var V;
        function F() { };
        class C { };
        interface I { };
        module M { };
        export var eV;
        export function eF() { };
        export class eC { };
        export interface eI { };
        export module eM { };
        export declare var eaV;
        export declare function eaF() { };
        export declare class eaC { };
        export declare module eaM { };
    }
    export declare var eaV;
    export declare function eaF() { };
    export declare class eaC {
        constructor () { }
        public pV;
        private rV;
        public pF() { }
        private rF() { }
        public pgF() { }
        public get pgF()
        public psF(param:any) { }
        public set psF(param:any)
        private rgF() { }
        private get rgF()
        private rsF(param:any) { }
        private set rsF(param:any)
        static tV;
        static tF() { }
        static tsF(param:any) { }
        static set tsF(param:any)
        static tgF() { }
        static get tgF()
    }
    export declare module eaM {
        var V;
        function F() { };
        class C { }
        interface I { }
        module M { }
        export var eV;
        export function eF() { };
        export class eC { }
        export interface eI { }
        export module eM { }
    }
}
export var eV;
export function eF() { };
export class eC {
    constructor () { }
    public pV;
    private rV;
    public pF() { }
    private rF() { }
    public pgF() { }
    public get pgF()
    public psF(param:any) { }
    public set psF(param:any)
    private rgF() { }
    private get rgF()
    private rsF(param:any) { }
    private set rsF(param:any)
    static tV;
    static tF() { }
    static tsF(param:any) { }
    static set tsF(param:any)
    static tgF() { }
    static get tgF()
}
export interface eI {
    //Call Signature
    ();
    (): number;
    (p);
    (p1: string);
    (p2?: string);
    (...p3: any[]);
    (p4: string, p5?: string);
    (p6: string, ...p7: any[]);
    //(p8?: string, ...p9: any[]);
    //(p10:string, p8?: string, ...p9: any[]);
    
    //Construct Signature
    new ();
    new (): number;
    new (p: string);
    new (p2?: string);
    new (...p3: any[]);
    new (p4: string, p5?: string);
    new (p6: string, ...p7: any[]);

    //Index Signature
    [p];
    [p1: string];
    [p2: string, p3: number];

    //Property Signature
    p;
    p1?;
    p2?: string;
    
    //Function Signature
    p3();
    p4? ();
    p5? (): void;
    p6(pa1): void;
    p7(pa1, pa2): void;
    p7? (pa1, pa2): void;
}
export module eM {
    var V;
    function F() { };
    class C {
        constructor () { }
        public pV;
        private rV;
        public pF() { }
        private rF() { }
        public pgF() { }
        public get pgF()
        public psF(param:any) { }
        public set psF(param:any)
        private rgF() { }
        private get rgF()
        private rsF(param:any) { }
        private set rsF(param:any)
        static tV;
        static tF() { }
        static tsF(param:any) { }
        static set tsF(param:any)
        static tgF() { }
        static get tgF()
    }
    interface I {
        //Call Signature
        ();
        (): number;
        (p);
        (p1: string);
        (p2?: string);
        (...p3: any[]);
        (p4: string, p5?: string);
        (p6: string, ...p7: any[]);
        //(p8?: string, ...p9: any[]);
        //(p10:string, p8?: string, ...p9: any[]);
    
        //Construct Signature
        new ();
        new (): number;
        new (p: string);
        new (p2?: string);
        new (...p3: any[]);
        new (p4: string, p5?: string);
        new (p6: string, ...p7: any[]);

        //Index Signature
        [p];
        [p1: string];
        [p2: string, p3: number];

        //Property Signature
        p;
        p1?;
        p2?: string;
    
        //Function Signature
        p3();
        p4? ();
        p5? (): void;
        p6(pa1): void;
        p7(pa1, pa2): void;
        p7? (pa1, pa2): void;
    }
    module M {
        var V;
        function F() { };
        class C { };
        interface I { };
        module M { };
        export var eV;
        export function eF() { };
        export class eC { };
        export interface eI { };
        export module eM { };
        export declare var eaV;
        export declare function eaF() { };
        export declare class eaC { };
        export declare module eaM { };
    }
    export var eV;
    export function eF() { };
    export class eC {
        constructor () { }
        public pV;
        private rV;
        public pF() { }
        private rF() { }
        public pgF() { }
        public get pgF()
        public psF(param:any) { }
        public set psF(param:any)
        private rgF() { }
        private get rgF()
        private rsF(param:any) { }
        private set rsF(param:any)
        static tV;
        static tF() { }
        static tsF(param:any) { }
        static set tsF(param:any)
        static tgF() { }
        static get tgF()
    }
    export interface eI {
        //Call Signature
        ();
        (): number;
        (p);
        (p1: string);
        (p2?: string);
        (...p3: any[]);
        (p4: string, p5?: string);
        (p6: string, ...p7: any[]);
        //(p8?: string, ...p9: any[]);
        //(p10:string, p8?: string, ...p9: any[]);
    
        //Construct Signature
        new ();
        new (): number;
        new (p: string);
        new (p2?: string);
        new (...p3: any[]);
        new (p4: string, p5?: string);
        new (p6: string, ...p7: any[]);

        //Index Signature
        [p];
        [p1: string];
        [p2: string, p3: number];

        //Property Signature
        p;
        p1?;
        p2?: string;
    
        //Function Signature
        p3();
        p4? ();
        p5? (): void;
        p6(pa1): void;
        p7(pa1, pa2): void;
        p7? (pa1, pa2): void;
    }
    export module eM {
        var V;
        function F() { };
        class C { };
        interface I { };
        module M { };
        export var eV;
        export function eF() { };
        export class eC { };
        export interface eI { };
        export module eM { };
        export declare var eaV;
        export declare function eaF() { };
        export declare class eaC { };
        export declare module eaM { };
    }
    export declare var eaV;
    export declare function eaF() { };
    export declare class eaC {
        constructor () { }
        public pV;
        private rV;
        public pF() { }
        private rF() { }
        public pgF() { }
        public get pgF()
        public psF(param:any) { }
        public set psF(param:any)
        private rgF() { }
        private get rgF()
        private rsF(param:any) { }
        private set rsF(param:any)
        static tV;
        static tF() { }
        static tsF(param:any) { }
        static set tsF(param:any)
        static tgF() { }
        static get tgF()
    }
    export declare module eaM {
        var V;
        function F() { };
        class C { }
        interface I { }
        module M { }
        export var eV;
        export function eF() { };
        export class eC { }
        export interface eI { }
        export module eM { }
    }
}
export declare var eaV;
export declare function eaF() { };
export declare class eaC {
    constructor () { }
    public pV;
    private rV;
    public pF() { }
    private rF() { }
    public pgF() { }
    public get pgF()
    public psF(param:any) { }
    public set psF(param:any)
    private rgF() { }
    private get rgF()
    private rsF(param:any) { }
    private set rsF(param:any)
    static tV;
    static tF() { }
    static tsF(param:any) { }
    static set tsF(param:any)
    static tgF() { }
    static get tgF()
}
export declare module eaM {
    var V;
    function F() { };
    class C {
        constructor () { }
        public pV;
        private rV;
        public pF() { }
        static tV;
        static tF() { }
    }
    interface I {
        //Call Signature
        ();
        (): number;
        (p: string);
        (p2?: string);
        (...p3: any[]);
        (p4: string, p5?: string);
        (p6: string, ...p7: any[]);
        //(p8?: string, ...p9: any[]);
        //(p10:string, p8?: string, ...p9: any[]);
    
        //Construct Signature
        new ();
        new (): number;
        new (p: string);
        new (p2?: string);
        new (...p3: any[]);
        new (p4: string, p5?: string);
        new (p6: string, ...p7: any[]);

        //Index Signature
        [p];
        [p1: string];
        [p2: string, p3: number];

        //Property Signature
        p;
        p1?;
        p2?: string;
    
        //Function Signature
        p3();
        p4? ();
        p5? (): void;
        p6(pa1): void;
        p7(pa1, pa2): void;
        p7? (pa1, pa2): void;
    }
    module M {
        var V;
        function F() { };
        class C { }
        interface I { }
        module M { }
        export var eV;
        export function eF() { };
        export class eC { }
        export interface eI { }
        export module eM { }
        export declare var eaV
        export declare function eaF() { };
        export declare class eaC { }
        export declare module eaM { }
    }
    export var eV;
    export function eF() { };
    export class eC {
        constructor () { }
        public pV;
        private rV;
        public pF() { }
        static tV
        static tF() { }
    }
    export interface eI {
        //Call Signature
        ();
        (): number;
        (p);
        (p1: string);
        (p2?: string);
        (...p3: any[]);
        (p4: string, p5?: string);
        (p6: string, ...p7: any[]);
        //(p8?: string, ...p9: any[]);
        //(p10:string, p8?: string, ...p9: any[]);
    
        //Construct Signature
        new ();
        new (): number;
        new (p: string);
        new (p2?: string);
        new (...p3: any[]);
        new (p4: string, p5?: string);
        new (p6: string, ...p7: any[]);

        //Index Signature
        [p];
        [p1: string];
        [p2: string, p3: number];

        //Property Signature
        p;
        p1?;
        p2?: string;
    
        //Function Signature
        p3();
        p4? ();
        p5? (): void;
        p6(pa1): void;
        p7(pa1, pa2): void;
        p7? (pa1, pa2): void;
    }
    export module eM {
        var V;
        function F() { };
        class C { }
        module M { }
        export var eV;
        export function eF() { };
        export class eC { }
        export interface eI { }
        export module eM { }
    }
}

//// [giant.js]
define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    /*
        Prefixes
        p -> public
        r -> private
        i -> import
        e -> export
        a -> ambient
        t -> static
        s -> set
        g -> get
    
        MAX DEPTH 3 LEVELS
    */
    var V;
    function F() { }
    ;
    var C = (function () {
        function C() {
        }
        C.prototype.pF = function () { };
        C.prototype.rF = function () { };
        C.prototype.pgF = function () { };
        Object.defineProperty(C.prototype, "pgF", {
            get: function () { },
            enumerable: true,
            configurable: true
        });
        C.prototype.psF = function (param) { };
        Object.defineProperty(C.prototype, "psF", {
            set: function (param) { },
            enumerable: true,
            configurable: true
        });
        C.prototype.rgF = function () { };
        Object.defineProperty(C.prototype, "rgF", {
            get: function () { },
            enumerable: true,
            configurable: true
        });
        C.prototype.rsF = function (param) { };
        Object.defineProperty(C.prototype, "rsF", {
            set: function (param) { },
            enumerable: true,
            configurable: true
        });
        C.tF = function () { };
        C.tsF = function (param) { };
        Object.defineProperty(C, "tsF", {
            set: function (param) { },
            enumerable: true,
            configurable: true
        });
        C.tgF = function () { };
        Object.defineProperty(C, "tgF", {
            get: function () { },
            enumerable: true,
            configurable: true
        });
        return C;
    }());
    var M;
    (function (M_1) {
        var V;
        function F() { }
        ;
        var C = (function () {
            function C() {
            }
            C.prototype.pF = function () { };
            C.prototype.rF = function () { };
            C.prototype.pgF = function () { };
            Object.defineProperty(C.prototype, "pgF", {
                get: function () { },
                enumerable: true,
                configurable: true
            });
            C.prototype.psF = function (param) { };
            Object.defineProperty(C.prototype, "psF", {
                set: function (param) { },
                enumerable: true,
                configurable: true
            });
            C.prototype.rgF = function () { };
            Object.defineProperty(C.prototype, "rgF", {
                get: function () { },
                enumerable: true,
                configurable: true
            });
            C.prototype.rsF = function (param) { };
            Object.defineProperty(C.prototype, "rsF", {
                set: function (param) { },
                enumerable: true,
                configurable: true
            });
            C.tF = function () { };
            C.tsF = function (param) { };
            Object.defineProperty(C, "tsF", {
                set: function (param) { },
                enumerable: true,
                configurable: true
            });
            C.tgF = function () { };
            Object.defineProperty(C, "tgF", {
                get: function () { },
                enumerable: true,
                configurable: true
            });
            return C;
        }());
        var M;
        (function (M) {
            var V;
            function F() { }
            ;
            var C = (function () {
                function C() {
                }
                return C;
            }());
            ;
            ;
            ;
            function eF() { }
            M.eF = eF;
            ;
            var eC = (function () {
                function eC() {
                }
                return eC;
            }());
            M.eC = eC;
            ;
            ;
            ;
            ;
            ;
            ;
        })(M || (M = {}));
        function eF() { }
        M_1.eF = eF;
        ;
        var eC = (function () {
            function eC() {
            }
            eC.prototype.pF = function () { };
            eC.prototype.rF = function () { };
            eC.prototype.pgF = function () { };
            Object.defineProperty(eC.prototype, "pgF", {
                get: function () { },
                enumerable: true,
                configurable: true
            });
            eC.prototype.psF = function (param) { };
            Object.defineProperty(eC.prototype, "psF", {
                set: function (param) { },
                enumerable: true,
                configurable: true
            });
            eC.prototype.rgF = function () { };
            Object.defineProperty(eC.prototype, "rgF", {
                get: function () { },
                enumerable: true,
                configurable: true
            });
            eC.prototype.rsF = function (param) { };
            Object.defineProperty(eC.prototype, "rsF", {
                set: function (param) { },
                enumerable: true,
                configurable: true
            });
            eC.tF = function () { };
            eC.tsF = function (param) { };
            Object.defineProperty(eC, "tsF", {
                set: function (param) { },
                enumerable: true,
                configurable: true
            });
            eC.tgF = function () { };
            Object.defineProperty(eC, "tgF", {
                get: function () { },
                enumerable: true,
                configurable: true
            });
            return eC;
        }());
        M_1.eC = eC;
        var eM;
        (function (eM) {
            var V;
            function F() { }
            ;
            var C = (function () {
                function C() {
                }
                return C;
            }());
            ;
            ;
            ;
            function eF() { }
            eM.eF = eF;
            ;
            var eC = (function () {
                function eC() {
                }
                return eC;
            }());
            eM.eC = eC;
            ;
            ;
            ;
            ;
            ;
            ;
        })(eM = M_1.eM || (M_1.eM = {}));
        ;
    })(M || (M = {}));
    function eF() { }
    exports.eF = eF;
    ;
    var eC = (function () {
        function eC() {
        }
        eC.prototype.pF = function () { };
        eC.prototype.rF = function () { };
        eC.prototype.pgF = function () { };
        Object.defineProperty(eC.prototype, "pgF", {
            get: function () { },
            enumerable: true,
            configurable: true
        });
        eC.prototype.psF = function (param) { };
        Object.defineProperty(eC.prototype, "psF", {
            set: function (param) { },
            enumerable: true,
            configurable: true
        });
        eC.prototype.rgF = function () { };
        Object.defineProperty(eC.prototype, "rgF", {
            get: function () { },
            enumerable: true,
            configurable: true
        });
        eC.prototype.rsF = function (param) { };
        Object.defineProperty(eC.prototype, "rsF", {
            set: function (param) { },
            enumerable: true,
            configurable: true
        });
        eC.tF = function () { };
        eC.tsF = function (param) { };
        Object.defineProperty(eC, "tsF", {
            set: function (param) { },
            enumerable: true,
            configurable: true
        });
        eC.tgF = function () { };
        Object.defineProperty(eC, "tgF", {
            get: function () { },
            enumerable: true,
            configurable: true
        });
        return eC;
    }());
    exports.eC = eC;
    var eM;
    (function (eM_1) {
        var V;
        function F() { }
        ;
        var C = (function () {
            function C() {
            }
            C.prototype.pF = function () { };
            C.prototype.rF = function () { };
            C.prototype.pgF = function () { };
            Object.defineProperty(C.prototype, "pgF", {
                get: function () { },
                enumerable: true,
                configurable: true
            });
            C.prototype.psF = function (param) { };
            Object.defineProperty(C.prototype, "psF", {
                set: function (param) { },
                enumerable: true,
                configurable: true
            });
            C.prototype.rgF = function () { };
            Object.defineProperty(C.prototype, "rgF", {
                get: function () { },
                enumerable: true,
                configurable: true
            });
            C.prototype.rsF = function (param) { };
            Object.defineProperty(C.prototype, "rsF", {
                set: function (param) { },
                enumerable: true,
                configurable: true
            });
            C.tF = function () { };
            C.tsF = function (param) { };
            Object.defineProperty(C, "tsF", {
                set: function (param) { },
                enumerable: true,
                configurable: true
            });
            C.tgF = function () { };
            Object.defineProperty(C, "tgF", {
                get: function () { },
                enumerable: true,
                configurable: true
            });
            return C;
        }());
        var M;
        (function (M) {
            var V;
            function F() { }
            ;
            var C = (function () {
                function C() {
                }
                return C;
            }());
            ;
            ;
            ;
            function eF() { }
            M.eF = eF;
            ;
            var eC = (function () {
                function eC() {
                }
                return eC;
            }());
            M.eC = eC;
            ;
            ;
            ;
            ;
            ;
            ;
        })(M || (M = {}));
        function eF() { }
        eM_1.eF = eF;
        ;
        var eC = (function () {
            function eC() {
            }
            eC.prototype.pF = function () { };
            eC.prototype.rF = function () { };
            eC.prototype.pgF = function () { };
            Object.defineProperty(eC.prototype, "pgF", {
                get: function () { },
                enumerable: true,
                configurable: true
            });
            eC.prototype.psF = function (param) { };
            Object.defineProperty(eC.prototype, "psF", {
                set: function (param) { },
                enumerable: true,
                configurable: true
            });
            eC.prototype.rgF = function () { };
            Object.defineProperty(eC.prototype, "rgF", {
                get: function () { },
                enumerable: true,
                configurable: true
            });
            eC.prototype.rsF = function (param) { };
            Object.defineProperty(eC.prototype, "rsF", {
                set: function (param) { },
                enumerable: true,
                configurable: true
            });
            eC.tF = function () { };
            eC.tsF = function (param) { };
            Object.defineProperty(eC, "tsF", {
                set: function (param) { },
                enumerable: true,
                configurable: true
            });
            eC.tgF = function () { };
            Object.defineProperty(eC, "tgF", {
                get: function () { },
                enumerable: true,
                configurable: true
            });
            return eC;
        }());
        eM_1.eC = eC;
        var eM;
        (function (eM) {
            var V;
            function F() { }
            ;
            var C = (function () {
                function C() {
                }
                return C;
            }());
            ;
            ;
            ;
            function eF() { }
            eM.eF = eF;
            ;
            var eC = (function () {
                function eC() {
                }
                return eC;
            }());
            eM.eC = eC;
            ;
            ;
            ;
            ;
            ;
            ;
        })(eM = eM_1.eM || (eM_1.eM = {}));
        ;
    })(eM = exports.eM || (exports.eM = {}));
    ;
});


//// [giant.d.ts]
export declare var eV: any;
export declare function eF(): void;
export declare class eC {
    constructor();
    pV: any;
    private rV;
    pF(): void;
    private rF();
    pgF(): void;
    readonly pgF: any;
    psF(param: any): void;
    psF: any;
    private rgF();
    private readonly rgF;
    private rsF(param);
    private rsF;
    static tV: any;
    static tF(): void;
    static tsF(param: any): void;
    static tsF: any;
    static tgF(): void;
    static readonly tgF: any;
}
export interface eI {
    (): any;
    (): number;
    (p: any): any;
    (p1: string): any;
    (p2?: string): any;
    (...p3: any[]): any;
    (p4: string, p5?: string): any;
    (p6: string, ...p7: any[]): any;
    new (): any;
    new (): number;
    new (p: string): any;
    new (p2?: string): any;
    new (...p3: any[]): any;
    new (p4: string, p5?: string): any;
    new (p6: string, ...p7: any[]): any;
    [p1: string]: any;
    [p2: string, p3: number]: any;
    p: any;
    p1?: any;
    p2?: string;
    p3(): any;
    p4?(): any;
    p5?(): void;
    p6(pa1: any): void;
    p7(pa1: any, pa2: any): void;
    p7?(pa1: any, pa2: any): void;
}
export declare module eM {
    var eV: any;
    function eF(): void;
    class eC {
        constructor();
        pV: any;
        private rV;
        pF(): void;
        private rF();
        pgF(): void;
        readonly pgF: any;
        psF(param: any): void;
        psF: any;
        private rgF();
        private readonly rgF;
        private rsF(param);
        private rsF;
        static tV: any;
        static tF(): void;
        static tsF(param: any): void;
        static tsF: any;
        static tgF(): void;
        static readonly tgF: any;
    }
    interface eI {
        (): any;
        (): number;
        (p: any): any;
        (p1: string): any;
        (p2?: string): any;
        (...p3: any[]): any;
        (p4: string, p5?: string): any;
        (p6: string, ...p7: any[]): any;
        new (): any;
        new (): number;
        new (p: string): any;
        new (p2?: string): any;
        new (...p3: any[]): any;
        new (p4: string, p5?: string): any;
        new (p6: string, ...p7: any[]): any;
        [p1: string]: any;
        [p2: string, p3: number]: any;
        p: any;
        p1?: any;
        p2?: string;
        p3(): any;
        p4?(): any;
        p5?(): void;
        p6(pa1: any): void;
        p7(pa1: any, pa2: any): void;
        p7?(pa1: any, pa2: any): void;
    }
    module eM {
        var eV: any;
        function eF(): void;
        class eC {
        }
        interface eI {
        }
        module eM {
        }
        var eaV: any;
        function eaF(): void;
        class eaC {
        }
        module eaM {
        }
    }
    var eaV: any;
    function eaF(): void;
    class eaC {
        constructor();
        pV: any;
        private rV;
        pF(): void;
        private rF();
        pgF(): void;
        readonly pgF: any;
        psF(param: any): void;
        psF: any;
        private rgF();
        private readonly rgF;
        private rsF(param);
        private rsF;
        static tV: any;
        static tF(): void;
        static tsF(param: any): void;
        static tsF: any;
        static tgF(): void;
        static readonly tgF: any;
    }
    module eaM {
        var V: any;
        function F(): void;
        class C {
        }
        interface I {
        }
        module M {
        }
        var eV: any;
        function eF(): void;
        class eC {
        }
        interface eI {
        }
        module eM {
        }
    }
}
export declare var eaV: any;
export declare function eaF(): void;
export declare class eaC {
    constructor();
    pV: any;
    private rV;
    pF(): void;
    private rF();
    pgF(): void;
    readonly pgF: any;
    psF(param: any): void;
    psF: any;
    private rgF();
    private readonly rgF;
    private rsF(param);
    private rsF;
    static tV: any;
    static tF(): void;
    static tsF(param: any): void;
    static tsF: any;
    static tgF(): void;
    static readonly tgF: any;
}
export declare module eaM {
    var V: any;
    function F(): void;
    class C {
        constructor();
        pV: any;
        private rV;
        pF(): void;
        static tV: any;
        static tF(): void;
    }
    interface I {
        (): any;
        (): number;
        (p: string): any;
        (p2?: string): any;
        (...p3: any[]): any;
        (p4: string, p5?: string): any;
        (p6: string, ...p7: any[]): any;
        new (): any;
        new (): number;
        new (p: string): any;
        new (p2?: string): any;
        new (...p3: any[]): any;
        new (p4: string, p5?: string): any;
        new (p6: string, ...p7: any[]): any;
        [p1: string]: any;
        [p2: string, p3: number]: any;
        p: any;
        p1?: any;
        p2?: string;
        p3(): any;
        p4?(): any;
        p5?(): void;
        p6(pa1: any): void;
        p7(pa1: any, pa2: any): void;
        p7?(pa1: any, pa2: any): void;
    }
    module M {
        var V: any;
        function F(): void;
        class C {
        }
        interface I {
        }
        module M {
        }
        var eV: any;
        function eF(): void;
        class eC {
        }
        interface eI {
        }
        module eM {
        }
        var eaV: any;
        function eaF(): void;
        class eaC {
        }
        module eaM {
        }
    }
    var eV: any;
    function eF(): void;
    class eC {
        constructor();
        pV: any;
        private rV;
        pF(): void;
        static tV: any;
        static tF(): void;
    }
    interface eI {
        (): any;
        (): number;
        (p: any): any;
        (p1: string): any;
        (p2?: string): any;
        (...p3: any[]): any;
        (p4: string, p5?: string): any;
        (p6: string, ...p7: any[]): any;
        new (): any;
        new (): number;
        new (p: string): any;
        new (p2?: string): any;
        new (...p3: any[]): any;
        new (p4: string, p5?: string): any;
        new (p6: string, ...p7: any[]): any;
        [p1: string]: any;
        [p2: string, p3: number]: any;
        p: any;
        p1?: any;
        p2?: string;
        p3(): any;
        p4?(): any;
        p5?(): void;
        p6(pa1: any): void;
        p7(pa1: any, pa2: any): void;
        p7?(pa1: any, pa2: any): void;
    }
    module eM {
        var V: any;
        function F(): void;
        class C {
        }
        module M {
        }
        var eV: any;
        function eF(): void;
        class eC {
        }
        interface eI {
        }
        module eM {
        }
    }
}
