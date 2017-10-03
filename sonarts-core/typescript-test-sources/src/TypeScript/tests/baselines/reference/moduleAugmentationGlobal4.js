//// [tests/cases/compiler/moduleAugmentationGlobal4.ts] ////

//// [f1.ts]
declare global {
    interface Something {x}
}
export {};
//// [f2.ts]
declare global {
    interface Something {y}
}
export {};
//// [f3.ts]
import "./f1";
import "./f2";



//// [f1.js]
"use strict";
exports.__esModule = true;
//// [f2.js]
"use strict";
exports.__esModule = true;
//// [f3.js]
"use strict";
exports.__esModule = true;
require("./f1");
require("./f2");


//// [f1.d.ts]
declare global  {
    interface Something {
        x: any;
    }
}
export {  };
export {};
//// [f2.d.ts]
declare global  {
    interface Something {
        y: any;
    }
}
export {  };
export {};
//// [f3.d.ts]
import "./f1";
import "./f2";
