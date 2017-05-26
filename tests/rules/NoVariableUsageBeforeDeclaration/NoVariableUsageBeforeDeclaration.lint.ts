// tslint:disable

let foo, es6;

function fun1(x) {
  foo(x);            // OK
}

foo(x);
//  ^                  {{Move the declaration of "x" before this usage.}}
var x = 1;

function fun2() {
  foo(y);
//    ^                {{Move the declaration of "y" before this usage.}}
}
var y = 1;

function* fun3() {
  foo(z);
//    ^                {{Move the declaration of "z" before this usage.}}
}
var z = 1;

var fun4 = function () {
  fun4();
}

var f = () => {
  foo(c);
//    ^                {{Move the declaration of "c" before this usage.}}
}
var c;

for (e in es6) {}
//   ^                 {{Move the declaration of "e" before this usage.}}
var e;

const bar = 3;

for (var v in foo) {
  foo[v] = 1;
}

function fun5() {
  var i = 5;
  i++;
  var i = 6;
}
