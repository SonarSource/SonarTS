//// [declFileClassWithIndexSignature.ts]
class BlockIntrinsics {
    [s: string]: string;
}

//// [declFileClassWithIndexSignature.js]
var BlockIntrinsics = (function () {
    function BlockIntrinsics() {
    }
    return BlockIntrinsics;
}());


//// [declFileClassWithIndexSignature.d.ts]
declare class BlockIntrinsics {
    [s: string]: string;
}
