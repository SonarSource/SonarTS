function foo() {
  let x = 42; // typescript:S1854 (dead store)
  x = 0, 5;   // typescript:S878 (comma), typescript:S905 (unused expression) (duplicate for this one is filtered out for no-unused-expression)
  if (x > 0) {
    let y = 42 // external_tslint:prefer-const, external_tslint:semicolon
    return y;
  } else // external_tslint:curly
    return x;
}
