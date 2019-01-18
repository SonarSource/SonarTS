export function toCreateModule() {}

function small(p: number) {
  if (p > 0) {
    return 42;
  }
}

  function big(p: number) {
//^^^^^^^^ {{This function has 7 lines, which is greater than the 5 lines authorized. Split it into smaller functions.}} 
  if (p > 0) {
    return 42;
  }

  return 0;
}

let funcExpr = function (p: number) {
//             ^^^^^^^^ {{This function has 7 lines, which is greater than the 5 lines authorized. Split it into smaller functions.}} 
  if (p > 0) {
    return 42;
  }

  return 0;
}

class MyClass {
  bigMethod(p: number) {
//^^^^^^^^^ {{This function has 7 lines, which is greater than the 5 lines authorized. Split it into smaller functions.}} 
      if (p > 0) {
        return 42;
      }
    
      return 0;
  }
}
