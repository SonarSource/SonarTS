// tslint:disable

let foo, es6;

function parameterUsages() {

  function someFunction(x) {
    foo(x);            // OK
  }

  foo(x);
//    ^                  {{Move the declaration of "x" before this usage.}}
  var x = 1;

}

function usagesFromWithinFunctions() {

  function someFunction() {
    foo(y);
//      ^                {{Move the declaration of "y" before this usage.}}
  }
  var y = 1;

  function* generatorFunction() {
    foo(z);
//      ^                {{Move the declaration of "z" before this usage.}}
  }
  var z = 1;

  var recursive = function () {
    recursive();
  }

}

function usageWithinArrowFunction() {
  var f = () => {
    foo(c);
  //    ^                {{Move the declaration of "c" before this usage.}}
  }
  var c;
}

function usagesInLoops() {

  for (e in es6) {}
//     ^                 {{Move the declaration of "e" before this usage.}}
  var e;

  const bar = 3;

  for (var v in foo) {
    foo[v] = 1;
  }

}


function ignoreAlreadyDeclaredVariable() {
  var i = 5;
  i++;
  var i = 6;
}

function multipleUsages() {
  x = 0;
//^                    {{Move the declaration of "x" before this usage.}}
  x = 1;
  var x;
}