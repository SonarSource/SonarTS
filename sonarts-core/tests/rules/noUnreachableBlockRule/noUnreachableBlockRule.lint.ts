function alwaysTrueIf(x: number[], y: {}) {
  if (x) return 1;
  //  ^ FN: This condition always evaluates to "true".
  if (!!y) return 1;
  //  ^^^ FN: This condition always evaluates to "true".
}

function alwaysFalseIf(x: {}, y: undefined, z: null, w: void, u: undefined | null) {
  if (!x) return 1;
  //  ^^ FN: This condition always evaluates to "false".
  if (y) return 1;
  //  ^ FN: This condition always evaluates to "false".
  if (z) return 1;
  //  ^ FN: This condition always evaluates to "false".
  if (w) return 1;
  //  ^ FN: This condition always evaluates to "false".
  if (u) return 1;
  //  ^ FN: This condition always evaluates to "false".
  if ("") return 1;
  //  ^^ FN: This condition always evaluates to "false".
  if (0) return 1;
  //  ^ {{This condition always evaluates to "false".}}
  if (NaN) return 1;
  //  ^^^ FN: This condition always evaluates to "false".
}

function parallelValues(y: boolean) {
  let x = 0;
  if (y) {
    x = 1;
  }
  if (y) {
    if (x) {
      //^  {{This condition always evaluates to "true".}}
    }
  }
}

function parallelTypes(x: string | number, y: boolean) {
  if (y) {
    x = foo();
  }
  if (y) {
    if (x !== "") {
      //  ^  FN: This condition always evaluates to "false".
    }
  }
}

function foo(): number {
  return 3;
}

function alwaysFalseIfByConstraint(x: string) {
  if (x) {
    if (x) {
      //^ {{This condition always evaluates to "true".}}
    }
  }

  if (x === "") {
    if (x) {
      //^ FN: This condition always evaluates to "false".
    }
  }
}

function alwaysTrueTernary(x: number[]) {
  return x ? 1 : 2;
  //     ^ FN: This condition always evaluates to "true".
}

function b(x: number) {
  if (x) return 1;
}

function d(x: string) {
  if (x) return 1;
}

function e(x: boolean) {
  if (x) return 1;
}

function j(x: number[] | null) {
  if (x) return 1;
}

function k(x: number[] & null) {
  if (x) return 1;
}

function m(x: number) {
  return x ? 1 : 2;
}

function n(x: any) {
  return x ? 1 : 2;
}

function optionals(x?: {}) {
  if (x) return 1;
}

class Foo {
  x: Foo;

  public ownProperty() {
    if (this.x) return 1;
  }

  public interfaceProperty(foo: { bar: SomeInterface }) {
    if (foo.bar.x) return 1;
    //  ^^^^^^^^^ FN: This condition always evaluates to "true".
  }

  public classProperty(foo: { bar: SomeClass }) {
    if (foo.bar.x) return 1;
  }
}

interface SomeInterface {
  x: {};
}

class SomeClass {
  x: {};
}

function indexTypes(x: { [key: string]: {} }) {
  if (x["foo"]) return 1;
}

function changeInCallback(arr: number[]) {
  let flag = false;
  arr.forEach(x => {
    if (x > 3) flag = true;
  });

  if (!flag) return 1;
}

function dom() {
  return performance && performance.now ? performance.now() : null;
}

export default 1;

function equality() {
  let x = foo();
  const y = x;
  if (x === y) return 1;
  //  ^^^^^^^ FN: This condition always evaluates to "true".
}

function possiblyUndefinedParameter(parameter: any) {
  if (parameter === undefined) {
    // OK, parameter can be anything here
  }
}

namespace A {
  let bar: any;

  function foo() {
    if (bar === undefined) {
      // OK, we should ignore symbols declared outside of function scope
    }
  }
}

function escapeSqlIdentifier(str: string) {
  for (const c of str) {
    // ok, should not constrain `c` nor `str`
    if (str) {
    }
    if (c) {
    }
  }
}

function loopInsideIf(d: number) {
  if (d) {
    for (let i = d; i; i++) {}
  }
}

function and(x: Foo, y: Foo) {
  let z;
  z = x && y;
}

function logicalOrWithGlobals() {
  const z = x || y;

  if (z) {
  }
}

function changeInsideIf() {
  let x = foo();
  if (x) {
    x &= foo();
    if (x) {
    }
  }
}

function _switch(x: number) {
  switch (x) {
    case 1:
      // ok, don't try to constrain `status`, nor `400`
      return "foo";
  }
}

function changeInNestedFunction() {
  let x = 0;

  inner();

  if (x) {
  }

  function inner() {
    x = 2;
  }
}
