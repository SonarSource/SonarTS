// tslint:disable

  function inconsistent(p: boolean) {
//^^^^^^^^  {{Refactor this function to use "return" consistently}}
    if (p) {
      return true;
    }
  }

function allExplicitReturns(p: boolean) {
  if (p) {
    return true;
  } else {
    return false;
  }
}

function allImplicitReturns(p: boolean) {
  if (p) {
    foo();
  } else {
    return;
  }

  function foo() {}
}

function nestedFunctions() {
  return true;

  function foo() {}
}

function infiniteFor() { // OK, there's no way to get to the end of the function
  for(;;) {
    return;
  }
}

function infiniteWhile() { // OK, there's no way to get to the end of the function
  while (true) {
    return;
  }
}

function explicitUndefinedDeclaration(p: boolean): number | undefined {
  if (p) {
    return 1;
  }
}

function empty() {

}

function explicitUndefinedDeclaration1(p: boolean): undefined {
  if (p) {
    return void 0;
  }
}

function explicitVoidDeclaration1(p: boolean): void | number {
  if (p) {
    return 0;
  }
}

function explicitVoidDeclaration(p: boolean): void {
  if (p) {
    return void 0;
  }

}

function withThrowAndExplicitReturn(cond: boolean) {
  if (cond) {
    throw "";
  }

  return 42;
}

function withThrowAndImplicitReturn(cond: boolean) {
  if (cond) {
    throw "";
  }
  console.log("bar");
}

var arrowWithExpressionBody = (p) => p ? true : false;

var inconsistentArrow = (p) => {if (p) { return true; } return; };
//                          ^^  {{Refactor this function to use "return" consistently}}

  function* inconsistentGenerator(p) {
//^^^^^^^^  {{Refactor this function to use "return" consistently}}
  let i = 0
  while(i < 10) {
    yield i++;
  }
  if (p) {
    return true;
  }
}

class A {
  inconsistentMethod(p) {
//^^^^^^^^^^^^^^^^^^  {{Refactor this function to use "return" consistently}}
    if (p) {
      return true;
    }
  }

  *inconsistentGenerator(p) {
// ^^^^^^^^^^^^^^^^^^^^^  {{Refactor this function to use "return" consistently}}
    if (p) {
      return;
    }
    return false;
  }

  private _value: number;

  get value(): number {
//^^^  {{Refactor this function to use "return" consistently}}
    if (this._value) {
      return this._value;
    } else {
      return;
    }
  }

}