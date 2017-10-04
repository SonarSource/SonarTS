// tslint:disable

let something, doSomething;

if (something) {}
//             ^^ {{Either remove or fill this block of code.}}

if (something) { /* empty */ }

if (something) { 
  /* empty */ 
}

if (something) { doSomething(); }

if (something) { doSomething(); } else {}
//                                     ^^ {{Either remove or fill this block of code.}}

if (something) { doSomething(); } else if (1 < 1) { /* empty */ }

doSomething(() => {});

for (var i = 0; i < length; i++) {}
//                               ^^ {{Either remove or fill this block of code.}}

for (var i = 0; i < length; i++) { /* empty */ }

for (var i = 0; i < length; i++) { doSomething(); }

// leading comment
while (something) { }

class Foo {
  constructor(private x: string) {}
  foo() {}
  set bar(a) {}
  get bar() {}
}

function foo() {}
function* bar() {}
var myObject = {
  myProperty: function() {},
  myProperty2: function*() {}
}

try {} catch (e) {}
//  ^^ {{Either remove or fill this block of code.}}
