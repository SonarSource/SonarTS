//// [declarationEmitInferedDefaultExportType2.ts]
// test.ts
export = {
  foo: [],
  bar: undefined,
  baz: null
}

//// [declarationEmitInferedDefaultExportType2.js]
"use strict";
module.exports = {
    foo: [],
    bar: undefined,
    baz: null
};


//// [declarationEmitInferedDefaultExportType2.d.ts]
declare const _default: {
    foo: any[];
    bar: any;
    baz: any;
};
export = _default;
