// NOK basic case

function foo() {  
  console.log("Hello");
  console.log("World");
  return 42;
}

  function bar() {
//^^^^^^^^ {{Update this function so that its implementation is not identical to the one on line 3.}}
//[3:0-7:1] < {{original implementation}}
  console.log("Hello");
  console.log("World");

  return 42;
}

// NOK different kinds of functions

let funcExpression = function () {
//                   ^^^^^^^^ {{Update this function so that its implementation is not identical to the one on line 3.}}  
  console.log("Hello");
  console.log("World");
  return 42;
}

let arrowFunction = () => {
//                     ^^ {{Update this function so that its implementation is not identical to the one on line 3.}}
  console.log("Hello");
  console.log("World");
  return 42;
}

class A {
  sameAsConstructor() {
    console.log("Hello");
    console.log("World");
    console.log("!");
  }

  constructor() {
//^^^^^^^^^^^ {{Update this function so that its implementation is not identical to the one on line 35.}}
    console.log("Hello");
    console.log("World");
    console.log("!");
  }    

  method() {
//^^^^^^ {{Update this function so that its implementation is not identical to the one on line 3.}}
    console.log("Hello");
    console.log("World");
    return 42;
  }

  set setter(p) {
//    ^^^^^^ {{Update this function so that its implementation is not identical to the one on line 3.}}
    console.log("Hello");
    console.log("World");
    return 42;
  }

  get getter() {
//    ^^^^^^ {{Update this function so that its implementation is not identical to the one on line 3.}}
    console.log("Hello");
    console.log("World");
    return 42;
  }
}


// NOK single statement but many lines

function foo1() {
  return [
    1,
  ];
}

  function bar1() {
//^^^^^^^^ {{Update this function so that its implementation is not identical to the one on line 73.}}
  return [
    1,
  ];
}

// OK 2 lines

function foo2() {
  console.log("Hello");
  return 42;
}

function bar3() {
  console.log("Hello");
  return 42;
}

// NOK different literal values

function foo1() {
  foo("Hello");
  foo("World");
  return 42;
}

  function foo2() {
//^^^^^^^^ {{Update this function so that its implementation is not identical to the one on line 100.}}
  foo("Hello, world!");
  foo("");
  return 0;
}