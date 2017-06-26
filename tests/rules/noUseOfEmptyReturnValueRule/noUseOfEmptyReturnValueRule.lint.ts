// tslint:disable

let foo, condition, x, z, doSomething, doSomethingElse, boolVar, arr;

function main() {
  function noReturn(a?: any) {
    let x = () => { return 1 }
  }

  noReturn(); // OK

  (noReturn()); // OK

  ((noReturn())); // OK

  x = noReturn();
//    ^^^^^^^^               {{Remove this use of the output from "noReturn"; "noReturn" doesn't return anything.}}

  let y = noReturn();
//        ^^^^^^^^           {{Remove this use of the output from "noReturn"; "noReturn" doesn't return anything.}}

  foo(noReturn());
//    ^^^^^^^^               {{Remove this use of the output from "noReturn"; "noReturn" doesn't return anything.}}

  arr[noReturn()];
//    ^^^^^^^^               {{Remove this use of the output from "noReturn"; "noReturn" doesn't return anything.}}

  let obj = {
    noReturn() { let prop = 0; }
  }

  let z = obj.noReturn();
//        ^^^^^^^^^^^^       {{Remove this use of the output from "noReturn"; "noReturn" doesn't return anything.}}

  let returnNoReturn = function () { return noReturn; };

  z = returnNoReturn()();
//    ^^^^^^^^^^^^^^^^       {{Remove this use of the output from "returnNoReturn()"; "returnNoReturn()" doesn't return anything.}}

  function returnReturnNoReturn() {
    return function() { return { noReturn }};
  }

  z = returnReturnNoReturn()().noReturn();
//    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^     {{Remove this use of the output from "noReturn"; "noReturn" doesn't return anything.}}

  function returnObjectObjectNoReturn() {
    return { a: { b: { noReturn }}};
  }

  z = returnObjectObjectNoReturn().a.b.noReturn();
//    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^     {{Remove this use of the output from "noReturn"; "noReturn" doesn't return anything.}}

  let arrowFunc = (a) => noReturn(a); // OK

  let arrowFunc2 = (a) => (noReturn(a)); // OK

  boolVar ? noReturn() : doSomethingElse(); // OK

  noReturn() ? doSomething() : doSomethingElse();
//^^^^^^^^                   {{Remove this use of the output from "noReturn"; "noReturn" doesn't return anything.}}

  boolVar && noReturn(); // OK

  noReturn() && doSomething();
//^^^^^^^^                   {{Remove this use of the output from "noReturn"; "noReturn" doesn't return anything.}}

  boolVar || noReturn(); // OK


  let arrowImplicitReturn = (a) => a*2;
  z = arrowImplicitReturn(1); // OK

  let funcExpr = function() {
    if (condition) {
      return;
    }

    doSomething();
  }

  funcExpr(); // OK

  foo(funcExpr());
//    ^^^^^^^^               {{Remove this use of the output from "funcExpr"; "funcExpr" doesn't return anything.}}

  function sometimesReturnsValue() {
    if (condition) {
      return 42;
    }
  }

  // OK
  let w = sometimesReturnsValue();
  sometimesReturnsValue();


  x = (function(){}());
//     ^^^^^^^^^^^^          {{Remove this use of the output from this function; this function doesn't return anything.}}

  (function(){}());
  !function(){}();

  return noReturn(); // OK with return

  throw noReturn(); // OK with throw

  let arrowFunc3 = () => (noReturn(), true) // OK for comma expression when noReturn is on the left

}
