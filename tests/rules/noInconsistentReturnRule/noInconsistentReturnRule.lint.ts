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