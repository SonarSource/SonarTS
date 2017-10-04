function foo(x: number): boolean {
  if (x < x) {
    return true;
  }

  if (x < x) { // NOSONAR
    return true;
  }

  var y = "str1";
  y.concat("str2");

  return false;
}
