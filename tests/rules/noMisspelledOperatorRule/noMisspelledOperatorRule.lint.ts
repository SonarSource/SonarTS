// tslint:disable

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
