// tslint:disable

function methodsOnMath() {
  let x = -42;
  Math.abs(x);
//^^^^^^^^^^^    {{The return value of "abs" must be used.}}
}

function methodsOnDates() {
  var date = new Date();
  date.getDay();
//^^^^^^^^^^^^^    {{The return value of "getDay" must be used.}}
}

function methodsOnArray(arr1: any[]) {
  let arr = [1, 2, 3];
  arr.slice(0, 2);
//^^^^^^^^^^^^^^^    {{The return value of "slice" must be used.}}

  arr1.join(",");
//^^^^^^^^^^^^^^    {{The return value of "join" must be used.}}

  arr.map(function(x){ });
//^^^^^^^^^^^^^^^^^^^^^^^    {{Consider using "forEach" instead of "map" as its return value is not being used here.}}
}

function methodsOnString() {
  let x = "abc";

  x.concat("abc");
//^^^^^^^^^^^^^^^    {{The return value of "concat" must be used.}}

  "abc".concat("bcd").charCodeAt(2);
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^    {{The return value of "charCodeAt" must be used.}}

  "abc".concat("bcd");
//^^^^^^^^^^^^^^^^^^^    {{The return value of "concat" must be used.}}

  "abc".replace(/ab/, "d");
//^^^^^^^^^^^^^^^^^^^^^^^^    {{The return value of "replace" must be used.}}

  // "replace" with callback is OK
  "abc".replace(/ab/, () => "");
  "abc".replace(/ab/, function() {return ""});
}

function methodsOnNumbers() {
  var num = 43 * 53;
  num.toExponential();
//^^^^^^^^^^^^^^^^^^^    {{The return value of "toExponential" must be used.}}
}

function methodsOnRegexp() {
  var regexp = /abc/;
  regexp.test("my string");
//^^^^^^^^^^^^^^^^^^^^^^^^    {{The return value of "test" must be used.}}
}

function returnIsNotIgnored() {
  var x = "abc".concat("bcd");

  if ([1, 2, 3].lastIndexOf(42)) {
    return true;
  }
}

function noSupportForUserTypes() {
  class A {
    methodWithoutSideEffect() {
      return 42;
    }
  }

  (new A()).methodWithoutSideEffect(); // OK
}

function unknownType(x: any) {
  x.foo();
}