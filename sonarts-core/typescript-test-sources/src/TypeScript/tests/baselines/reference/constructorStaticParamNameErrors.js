//// [constructorStaticParamNameErrors.ts]
'use strict'
// static as constructor parameter name should give error if 'use strict'
class test {
    constructor (static) { }
}

//// [constructorStaticParamNameErrors.js]
'use strict';
// static as constructor parameter name should give error if 'use strict'
var test = (function () {
    function test(static) {
    }
    return test;
}());
