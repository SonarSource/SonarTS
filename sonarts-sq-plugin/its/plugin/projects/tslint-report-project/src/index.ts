function foo() {
  let x = 42; // typescript:S1854
  x = 0;
  if (x > 0) {
    let y = 42 // external_tslint:prefer-const, external_tslint:semicolon
    return y;
  } else // external_tslint:curly
    return x;
}
