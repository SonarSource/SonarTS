function redundantBoolean(booleanMethod: () => boolean, doSomething: (x:any)=>any, booleanExp: boolean, notBoolean: any) {
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
