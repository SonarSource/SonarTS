function withNull(x: number & null) {}
//                   ^^^^^^^^^^^^^ {{Change this type declaration to a non-empty intersection.}}

function withUndefined(x: string & undefined) {}
//                        ^^^^^^^^^^^^^^^^^^ {{Change this type declaration to a non-empty intersection.}}

function withVoid(x: string & void) {}
//                   ^^^^^^^^^^^^^ {{Change this type declaration to a non-empty intersection.}}

function withNever(x: boolean & never) {}
//                    ^^^^^^^^^^^^^^^ {{Change this type declaration to a non-empty intersection.}}

function withPrimitive1(x: string & number) {}
//                         ^^^^^^^^^^^^^^^ {{Change this type declaration to a non-empty intersection.}}

function withPrimitive2(x: boolean & number) {}
//                         ^^^^^^^^^^^^^^^^ {{Change this type declaration to a non-empty intersection.}}

function triple(x: null & string & undefined) {}
//                 ^^^^^^^^^^^^^^^^^^^^^^^^^ {{Change this type declaration to a non-empty intersection.}}

function declarations() {
  let x: string & null;
  //     ^^^^^^^^^^^^^ {{Change this type declaration to a non-empty intersection.}}
}

export default 1;
