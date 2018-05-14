// too small
console.log("a&b");
console.log("a&b");
console.log("a&b");

console.log("only 2 times");
console.log("only 2 times");

// no separators
console.log("stringstring");
console.log("stringstring");
console.log("stringstring");
console.log("stringstring");

console.log("some message");
//          ^^^^^^^^^^^^^^ {{Define a constant instead of duplicating this literal 3 times.}} [[cost:2]]
console.log("some message");
//          ^^^^^^^^^^^^^^ < {{Duplicate}}
console.log('some message');
//          ^^^^^^^^^^^^^^ < {{Duplicate}}


function ignoreReactAttributes() {
  <Foo bar="some string"></Foo>;
  <Foo bar="some string"></Foo>;
  <Foo bar="some string"></Foo>;

  <Foo className="some-string"></Foo>;
  let x = "some-string", y = "some-string", z = "some-string";
//        ^^^^^^^^^^^^^ {{Define a constant instead of duplicating this literal 3 times.}} [[cost:2]]
}
