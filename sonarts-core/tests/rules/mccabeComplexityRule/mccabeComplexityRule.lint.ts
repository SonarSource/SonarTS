export function toCreateModule() {}

  function complexFunction() { // +1
//^^^^^^^^ {{The Cyclomatic Complexity of this function is 12 which is greater than 10 authorized.}} [[cost:2]]

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
