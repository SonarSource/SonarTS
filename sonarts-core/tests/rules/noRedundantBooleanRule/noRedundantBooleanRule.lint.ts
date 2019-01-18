export function toCreateModule() {}

function redundantBoolean(
  booleanMethod: () => boolean,
  doSomething: (x: any) => any,
  booleanExp: boolean,
  notBoolean: any,
) {
  if (booleanMethod() == true) {
//                       ^^^^ {{Remove the unnecessary boolean literal.}}
    /* ... */
  }
  if (booleanMethod() == false) {
//                       ^^^^^ {{Remove the unnecessary boolean literal.}}
    /* ... */
  }
  if (booleanMethod() || false) {
//                       ^^^^^ {{Remove the unnecessary boolean literal.}}
    /* ... */
  }
  if (booleanMethod() && true) {
//                       ^^^^ {{Remove the unnecessary boolean literal.}}
    /* ... */
  }
  doSomething(!false);
//             ^^^^^ {{Remove the unnecessary boolean literal.}}
  doSomething(booleanMethod() == true);
//                               ^^^^ {{Remove the unnecessary boolean literal.}}

  let booleanVariable;
  booleanVariable = booleanMethod() ? true : false;
//                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ {{Simplify this expression.}}

  // ok for conditional expressions, as it's more readable sometimes with boolean literals
  booleanVariable = booleanMethod() ? true : booleanExp;
  booleanVariable = booleanMethod() ? false : booleanExp;
  booleanVariable = booleanMethod() ? booleanExp : true;
  booleanVariable = booleanMethod() ? booleanExp : false;
}

function ignoreTripleEquals(mayBeBoolean?: boolean) {
  let x = [2, 3, 4].includes(3);
  let y = true;
  console.log(x === true);
  console.log(y !== true);
  return mayBeBoolean !== false;
}

function ignoreOrFalse(mayBeSomething? : any) {
  console.log(mayBeSomething || false);

  if (foo(mayBeSomething || false)) {
  }

  if (mayBeSomething || false) { 
//                      ^^^^^ {{Remove the unnecessary boolean literal.}}
  }

  let x = mayBeSomething || false ? 1 : 2;
//                          ^^^^^ {{Remove the unnecessary boolean literal.}}
  return mayBeSomething || false;
}