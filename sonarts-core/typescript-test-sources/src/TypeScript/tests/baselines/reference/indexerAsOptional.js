//// [indexerAsOptional.ts]
interface indexSig {
    //Index signatures can't be optional
    [idx?: number]: any; //err
}

class indexSig2 {
    //Index signatures can't be optional
    [idx?: number]: any //err
}

//// [indexerAsOptional.js]
var indexSig2 = (function () {
    function indexSig2() {
    }
    return indexSig2;
}());
