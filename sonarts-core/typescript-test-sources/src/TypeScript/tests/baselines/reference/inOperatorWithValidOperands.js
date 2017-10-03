//// [inOperatorWithValidOperands.ts]
var x: any;

// valid left operands
// the left operand is required to be of type Any, the String primitive type, or the Number primitive type
var a1: string;
var a2: number;

var ra1 = x in x;
var ra2 = a1 in x;
var ra3 = a2 in x;
var ra4 = '' in x;
var ra5 = 0 in x;

// valid right operands
// the right operand is required to be of type Any, an object type, or a type parameter type
var b1: {};

var rb1 = x in b1;
var rb2 = x in {};

function foo<T>(t: T) {
    var rb3 = x in t;
}

interface X { x: number }
interface Y { y: number }

var c1: X | Y;
var c2: X;
var c3: Y;

var rc1 = x in c1;
var rc2 = x in (c2 || c3);


//// [inOperatorWithValidOperands.js]
var x;
// valid left operands
// the left operand is required to be of type Any, the String primitive type, or the Number primitive type
var a1;
var a2;
var ra1 = x in x;
var ra2 = a1 in x;
var ra3 = a2 in x;
var ra4 = '' in x;
var ra5 = 0 in x;
// valid right operands
// the right operand is required to be of type Any, an object type, or a type parameter type
var b1;
var rb1 = x in b1;
var rb2 = x in {};
function foo(t) {
    var rb3 = x in t;
}
var c1;
var c2;
var c3;
var rc1 = x in c1;
var rc2 = x in (c2 || c3);
