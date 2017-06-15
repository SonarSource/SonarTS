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
    
  }

  function foo() {}
}
