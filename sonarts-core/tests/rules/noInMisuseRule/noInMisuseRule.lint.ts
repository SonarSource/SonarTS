function nokFunc1() {
  let arr = ["a", "b", "c"];
  let expectedValue1 = "1";
  let expectedValue2 = "b";
  if (expectedValue1 in arr) {
  //  ^^^^^^^^^^^^^^^^^^^^^    {{Use "indexOf" or "includes" (available from ES2016) instead.}}
    console.log("OK");
  }
  if (expectedValue2 in arr) {
//    ^^^^^^^^^^^^^^^^^^^^^    {{Use "indexOf" or "includes" (available from ES2016) instead.}}
    return 1;
  } else {
    return 2;
  }
}

// An erroneous way to search for an object property
function nokFunc3(a: any) {
  // testing "in" operator on a ternary operator
  const result = "car" in Object.keys(a) ? "something" : "someething else";
  //             ^^^^^^^^^^^^^^^^^^^^^^^ {{Use "indexOf" or "includes" (available from ES2016) instead.}}
  return result;
}

// An erroneous ES2016 "includes" implementation
function nokIncludes(array: any[], elem: any) {
  const result = elem in array;
  //             ^^^^^^^^^^^^^ {{Use "indexOf" or "includes" (available from ES2016) instead.}}
  return result;
}

function okFunc(a: string) {
  const dict = {
    a: 1,
    b: 2,
    c: 3,
  };
  if (a in dict) {
    return "Something";
  }
  return "Something else";
}

// Shouldn't be applied on array-like objects
function okFunc1(a: any, b: any) {
  let key = "1";
  if (key in arguments) {
    return "Something";
  }
  return "Something else";
}