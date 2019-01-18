export function toCreateModule() {}

// OK, doesn't have `any`
function foo() {
  return 1;
}

function returnNumericLiteral(): any {
  //                             ^^^ {{Remove this return type or change it to a more specific.}}
  return 1;
}

function returnNumber(): any {
  //                     ^^^ {{Remove this return type or change it to a more specific.}}
  return 1 + 1;
}

function returnStringLiteral(): any {
  //                            ^^^ {{Remove this return type or change it to a more specific.}}
  return "foo";
}

function returnString(): any {
  //                     ^^^ {{Remove this return type or change it to a more specific.}}
  return "".substr(1);
}

function returnBooleanLiteral(): any {
  //                             ^^^ {{Remove this return type or change it to a more specific.}}
  return false;
}

function returnBoolean(): any {
  //                      ^^^ {{Remove this return type or change it to a more specific.}}
  return 2 > 1;
}

function severalReturnsNumbers(x: any): any {
  //                                    ^^^ {{Remove this return type or change it to a more specific.}}
  if (x) {
    return 1 + 2;
  } else {
    return 3 + 7;
  }
}

function severalReturnsStrings(x: string): any {
  //                                       ^^^ {{Remove this return type or change it to a more specific.}}
  if (x.length > 3) {
    return x.substr(3);
  } else {
    return x;
  }
}

// OK, returns different primitive types
function returnDifferentPrimitiveTypes(x: any): any {
  if (x) {
    return 1;
  } else {
    return "baz";
  }
}

// OK, returns union type
function ternary(x: any): any {
  const y = x ? 1 : 2;
  return y;
}

// OK, returns non-primitive type
function createObject(): any {
  return { foo: 1, bar: null };
}

function withInnerFunction(): any {
  function inner() {
    return 1;
  }
}

// ok, returns complex type
function returnsSameComplexType(x: any): any {
  if (x) {
    return new Date();
  } else {
    return new Date();
  }
}

// OK, returns any in any case
function returnsAny(x: any, y: any): any {
  if (x) {
    return x;
  } else {
    return y;
  }
}

// to make this file a module
export default 1;
