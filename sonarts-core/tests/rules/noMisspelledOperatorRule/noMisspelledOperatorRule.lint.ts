export function toCreateModule() {}

let x1 = 0;

x1 =- 3;
// ^^  {{Was "-=" meant instead?}}
x1 =+ x1;
// ^^  {{Was "+=" meant instead?}}

x1 =! 2;
// ^^  {{Was "!=" meant instead?}}

// no whitespace between unary operator and operand
x1 =+4; // OK
x1 =-2; // OK
x1 =!x1 // OK

let x2 = 0;
x2 = - 3; // OK whitespace between = and -

// other unary operators are OK
let x3 = 0;
x3 = ++x2;
x3 = --x2;
x3 = ~x2;
