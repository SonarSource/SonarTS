class MyObject {}

function primitiveWrappers(y: any) {
  let x: any = new Boolean(y);
  //           ^^^^^^^^^^^^^^ {{Remove this use of 'Boolean' constructor.}}

  x = new Number();
  //  ^^^^^^^^^^^^ {{Remove this use of 'Number' constructor.}}
  x = new Number(y);
  //  ^^^^^^^^^^^^^ {{Remove this use of 'Number' constructor.}}
  x = new Number(true);
  //  ^^^^^^^^^^^^^^^^ {{Remove this use of 'Number' constructor.}}
  x = new Number(false);
  //  ^^^^^^^^^^^^^^^^^ {{Remove this use of 'Number' constructor.}}

  x = new String();
  //  ^^^^^^^^^^^^ {{Remove this use of 'String' constructor.}}
  x = new String(y);
  //  ^^^^^^^^^^^^^ {{Remove this use of 'String' constructor.}}
  x = new String(42);
  //  ^^^^^^^^^^^^^^ {{Remove this use of 'String' constructor.}}

  // OK with not primitive wrapper constructors
  x = new Array();
  x = new MyObject();

  // OK without "new"
  x = Boolean(y);
  x = Number(y);
  x = String(y);
}

// string + variable declaration
const x: String = "foo";
//       ^^^^^^ {{Replace this 'String' wrapper object with primitive type 'string'.}}

// string + function declaration
function primitiveString(x: string) {
  return x;
}
function wrapperString(x: String) {
  //                      ^^^^^^ {{Replace this 'String' wrapper object with primitive type 'string'.}}
  return x;
}

// number + arrow function
const primitiveNumber = (x: number) => x;
const wrapperNumber = (x: Number) => x;
//                        ^^^^^^ {{Replace this 'Number' wrapper object with primitive type 'number'.}}

// boolean + class properties + class methods
class Booleans {
  b: Boolean;
  // ^^^^^^^ {{Replace this 'Boolean' wrapper object with primitive type 'boolean'.}}

  primitiveBoolean(x: boolean) {
    return x;
  }

  wrapperBoolean = (x: Boolean) => x;
  //                   ^^^^^^^ {{Replace this 'Boolean' wrapper object with primitive type 'boolean'.}}
}

function union(p: String | number) {}
//                ^^^^^^ {{Replace this 'String' wrapper object with primitive type 'string'.}}

function intersection(p: String & number) {}
//                       ^^^^^^ {{Replace this 'String' wrapper object with primitive type 'string'.}}

// override built-in String type
namespace inner {
  type String = number;
  interface Number {}

  function stringTypeAlias(x: String) {
    return x;
  }

  // accepted FP
  function numberFP(x: Number) {
    //                 ^^^^^^ {{Replace this 'Number' wrapper object with primitive type 'number'.}}
    return x;
  }
}

export default 1;
