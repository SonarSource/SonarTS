//// [computedPropertiesInDestructuring2.ts]
let foo2 = () => "bar";
let {[foo2()]: bar3} = {};

//// [computedPropertiesInDestructuring2.js]
var foo2 = function () { return "bar"; };
var _a = foo2(), bar3 = {}[_a];
