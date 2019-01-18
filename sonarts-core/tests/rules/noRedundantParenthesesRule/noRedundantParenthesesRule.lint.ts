export function toCreateModule() {}

let x = (1 + 2);
x = ((1 + 2));
//  ^^^^^^^^^ {{Remove these useless parentheses.}}

console.log((1)); // OK