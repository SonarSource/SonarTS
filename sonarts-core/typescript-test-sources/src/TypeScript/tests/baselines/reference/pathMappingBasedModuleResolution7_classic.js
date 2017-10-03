//// [tests/cases/compiler/pathMappingBasedModuleResolution7_classic.ts] ////

//// [file1.ts]
import {x} from "./project/file2";
import {y} from "module3";

declare function use(x: string);
use(x.toFixed());
use(y.toFixed());

//// [file2.ts]
import {a} from "module1";
import {b} from "templates/module2";
import {x as c} from "../file3";
export let x = a + b + c;

//// [module1.d.ts]
export let a: number

//// [module2.ts]
export let b: number;

//// [file3.d.ts]
export let x: number;

//// [module3.d.ts]
export let y: number;



//// [module2.js]
define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
});
//// [file2.js]
define(["require", "exports", "module1", "templates/module2", "../file3"], function (require, exports, module1_1, module2_1, file3_1) {
    "use strict";
    exports.__esModule = true;
    exports.x = module1_1.a + module2_1.b + file3_1.x;
});
//// [file1.js]
define(["require", "exports", "./project/file2", "module3"], function (require, exports, file2_1, module3_1) {
    "use strict";
    exports.__esModule = true;
    use(file2_1.x.toFixed());
    use(module3_1.y.toFixed());
});
