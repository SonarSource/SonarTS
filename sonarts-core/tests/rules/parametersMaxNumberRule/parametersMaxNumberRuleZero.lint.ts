export function toCreateModule() {}

  function funcDecl(p1: number) {
//^^^^^^^^ {{This function has 1 parameters, which is greater than the 0 authorized.}}

}

let funcExpr = function(p1: number) {
//             ^^^^^^^^ {{This function has 1 parameters, which is greater than the 0 authorized.}}
}

let arrowFunc = (p1: number) => {
//                           ^^ {{This function has 1 parameters, which is greater than the 0 authorized.}}
}

class A {
  foo(p: number) {
//^^^ {{This function has 1 parameters, which is greater than the 0 authorized.}}
  }
}
