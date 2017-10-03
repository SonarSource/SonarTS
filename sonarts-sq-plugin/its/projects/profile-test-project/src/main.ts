function foo(x: number) { // S3801
  if (x < x) { // S1764
    return true;
  }

  var y = "str1";
  y.concat("str2"); // no issue, as S2201 is not activated
}
