// NOK basic case

function foo() {  
  console.log("Hello");
  console.log("World");
  return 42;
}

  function bar() {
//^^^^^^^^ {{Update or refactor this function so that its implementation doesn't duplicate the one on line 3.}}
//[3:0-7:1] < {{original implementation}}
  console.log("Hello");
  console.log("World");

  return 42;
}

// NOK different kinds of functions

let funcExpression = function () {
//                   ^^^^^^^^ {{Update or refactor this function so that its implementation doesn't duplicate the one on line 3.}}  
  console.log("Hello");
  console.log("World");
  return 42;
}

let arrowFunction = () => {
//                     ^^ {{Update or refactor this function so that its implementation doesn't duplicate the one on line 3.}}
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
//^^^^^^^^^^^ {{Update or refactor this function so that its implementation doesn't duplicate the one on line 35.}}
    console.log("Hello");
    console.log("World");
    console.log("!");
  }    

  method() {
//^^^^^^ {{Update or refactor this function so that its implementation doesn't duplicate the one on line 3.}}
    console.log("Hello");
    console.log("World");
    return 42;
  }

  set setter(p) {
//    ^^^^^^ {{Update or refactor this function so that its implementation doesn't duplicate the one on line 3.}}
    console.log("Hello");
    console.log("World");
    return 42;
  }

  get getter() {
//    ^^^^^^ {{Update or refactor this function so that its implementation doesn't duplicate the one on line 3.}}
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
//^^^^^^^^ {{Update or refactor this function so that its implementation doesn't duplicate the one on line 73.}}
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
//^^^^^^^^ {{Update or refactor this function so that its implementation doesn't duplicate the one on line 100.}}
  foo("Hello, world!");
  foo("");
  return 0;
}

class MethodWithStringLiteralNames {

  'weird function name'() {
    console.log("this is valid!");
    foo("");
    return 0;
  }

  'another one'() {
//^^^^^^^^^^^^^ {{Update or refactor this function so that its implementation doesn't duplicate the one on line 115.}}
    console.log("this is valid!");
    foo("");
    return 0;
  }
}

class MethodWithComputedProps {

  ["f" + ids.next().value]() {
    console.log("this is valid fun!");
    foo2("");
    return 0;
  }

  ["f" + ids.next().value]() {
//^^^^^^^^^^^^^^^^^^^^^^^^ {{Update or refactor this function so that its implementation doesn't duplicate the one on line 131.}}
    console.log("this is valid fun!");
    foo2("");
    return 0;
  }
}

let ids = (function* idsGen() {
  let i = 0;
  while (true) {
    yield i++;
  }
})();

export function toCreateModule() {}
