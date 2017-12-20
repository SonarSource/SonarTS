
  function complexFunction() { // +1
//^^^^^^^^ {{The Cyclomatic Complexity of this function is 12 which is greater than 1 authorized.}}

    if (42) {}; // +1
    while (42) {}; // +1
    do {} while (42); // +1
    for (let x in {}) {} // +1
    for (let x of []) {} // +1
    for (;42;) {} // +1
    switch (21 * 3) {
      case 1: // +1
      case 2: // +1
      default:
    }
    1 && 2; // +1
    1 || 2; // +1
    1? 2 : 3; // +1


    // no complexity
    try {} catch (e) {}
    function bar(){}
    return 32;    
}

function nestingFunction() {

  function nestedFunction() { // +1
//^^^^^^^^  {{The Cyclomatic Complexity of this function is 2 which is greater than 1 authorized.}}

    return 1 && 2; // +1
  }
}

class A {
  method() {
//^^^^^^  {{The Cyclomatic Complexity of this function is 2 which is greater than 1 authorized.}}

    return 1 && 2; 
  }

  set setter() {
//    ^^^^^^  {{The Cyclomatic Complexity of this function is 2 which is greater than 1 authorized.}}

    1 && 2; 
  }

  constructor() {
//^^^^^^^^^^^  {{The Cyclomatic Complexity of this function is 2 which is greater than 1 authorized.}}
    1 && 2;
  }
}

let arrowFunction = a => 1 && 2;
//                    ^^  {{The Cyclomatic Complexity of this function is 2 which is greater than 1 authorized.}}

let funcExpr = function() {
//             ^^^^^^^^  {{The Cyclomatic Complexity of this function is 2 which is greater than 1 authorized.}}

  1 && 2;
}