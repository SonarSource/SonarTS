export function sameType(a: number, b: number, c = 3) {}

const a = 1, b = 2, c = 3, d = 4;

sameType(a, b, c);
sameType(a, b, d);
sameType(d, d, d);
sameType(a, a, a);
sameType(42, a, c);
sameType(a, d, b);

sameType(b, a, d);
//       ^^^^^^^ {{Parameters 'b' and 'a' have the same names but not the same order as the arguments.}}

sameType(b, a, c);
//       ^^^^^^^ {{Parameters 'b' and 'a' have the same names but not the same order as the arguments.}}

sameType(c, 2, a);
//       ^^^^^^^ {{Parameters 'c' and 'a' have the same names but not the same order as the arguments.}}

sameType(b, a);
//       ^^^^ {{Parameters 'b' and 'a' have the same names but not the same order as the arguments.}}

sameType(42, c, b);
//       ^^^^^^^^ {{Parameters 'c' and 'b' have the same names but not the same order as the arguments.}}

function differentTypes(x: string, y: number, z = 42) {}

function okForDifferentTypes(x: number, y: string) {
  differentTypes(y, x);
}

function nokForSameType(z: number, y: number) {
  differentTypes("hello", z, y);
//               ^^^^^^^^^^^^^ {{Parameters 'z' and 'y' have the same names but not the same order as the arguments.}}
}

interface A {
  prop1: number
}

function objectType(a1: A, a2: A) {
  ((a1: A, a2: A) => {})
//  ^^^^^^^^^^^^ > {{Formal parameters}}
                        (a2, a1);
//                       ^^^^^^ {{Parameters 'a2' and 'a1' have the same names but not the same order as the arguments.}}
}

const from = 1, length = 2;
const standardMethod = "str".substr(length, from);
//                                  ^^^^^^^^^^^^ {{Parameters 'length' and 'from' have the same names but not the same order as the arguments.}}

unknown(a, b);


// These types are ignored by compiler, "any" is used
// Note that this does not test signature declaration being JSDocSignature, we didn't manage to find a way to reproduce it
/**
 * @param a number
 * @param b string
 */
function withJsDoc(a, b){}
withJsDoc(b, a);
//        ^^^^ {{Parameters 'b' and 'a' have the same names but not the same order as the arguments.}}

