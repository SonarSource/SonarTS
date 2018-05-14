function nokFunc1() {
  let arr = ["a", "b", "c"];

  let expectedValue = "b";
  if (expectedValue in arr) {
//    ^^^^^^^^^^^^^^^^^^^^    {{Use "indexOf" or "includes" (available from ES2016) instead.}}
    return expectedValue + " found in the array";
  } else {
    return expectedValue + " not found";
  }
}

function nokFunc2() {
  let arr = ["a", "b", "c"];

  let expectedValue = "1"; // index #1 is corresponding to the value "b"
  if (expectedValue in arr) {
//    ^^^^^^^^^^^^^^^^^^^^    {{Use "indexOf" or "includes" (available from ES2016) instead.}}
    return expectedValue + " found in the array";
  } else {
    return expectedValue + " not found";
  }
}


function nokFunc3(a: any) {
  const result = "car" in Object.keys(a) ? "something" : "someething else";
  //             ^^^^^^^^^^^^^^^^^^^^^^^ {{Use "indexOf" or "includes" (available from ES2016) instead.}}
  return result;
}

function nokContains(array: any[], elem: any) {
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