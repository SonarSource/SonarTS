// tslint:disable

while(foo()) {
  bar();
  if (baz()) {
    break;
  }
}

while(foo()) {
  switch (bar()) {
    case a : continue;
    case b : break
    case c : zoo();
  }
}

for(x of arr) {
  doSomething(() => { return "bar";});
}

while(foo()) {
  bar();
  break;
//^^^^^  {{Remove this "break" statement or make it conditional}}
}

while(foo()) {
  bar();
  continue;
//^^^^^^^^ {{Remove this "continue" statement or make it conditional}}
}

while(foo()) {
  bar();
  throw x;
//^^^^^   {{Remove this "throw" statement or make it conditional}}
}

while(foo())
  break;
//^^^^^  {{Remove this "break" statement or make it conditional}}

function f() {
  while(foo()) {
    bar();
    if (baz()) {
      return;
    }
  }
  while(foo()) {
    bar();
    return;
//  ^^^^^^  {{Remove this "return" statement or make it conditional}}
  }
}

do {
  bar();
  break;
//^^^^^  {{Remove this "break" statement or make it conditional}}
} while (foo())

for (i = 0; foo(); i++) {
  bar();
  break;
//^^^^^  {{Remove this "break" statement or make it conditional}}
}

for (p in obj) {
  bar();
  break; // Compliant: often used to check whether an object is "empty"
}

for (p in obj) {
  while(true) {
    bar();
    break;
//  ^^^^^  {{Remove this "break" statement or make it conditional}}
  }
}

for (p in obj) {
  foo();
  continue;
//^^^^^^^^  {{Remove this "continue" statement or make it conditional}}
}

for(p of arr) {
  bar();
  break;
//^^^^^  {{Remove this "break" statement or make it conditional}}
}

for(p of arr) {
  return p;  // Compliant: used to return the first element of an array
}

while(foo()) {
  if (bar()) {
    break;
  }
  baz();
  break;
//^^^^^  {{Remove this "break" statement or make it conditional}}
}

if (cond()) {
  while(foo()) {
    break;
//  ^^^^^  {{Remove this "break" statement or make it conditional}}
  }
}

while(foo()) {
  if (bar()) {
    continue;
  }
  baz();
  break; // Compliant: the loop can execute more than once
}


do {
  if(bar()) {
    continue;
  }
  baz();
  break; // Compliant: the loop can execture more than once
} while (foo())

while(foo()) {
  if (bar()) {
    continue;
  }
  baz();
  continue;
//^^^^^^^^  {{Remove this "continue" statement or make it conditional}}
}

for (i = 0; foo(); i++) {
  if (bar()) {
    continue;
  }
  baz();
  break; // Compliant
}

for (i = 0; foo();) {
  baz();
  break;
//^^^^^  {{Remove this "break" statement or make it conditional}}
}

for (i = 0; foo(); i++) {
  baz();
  continue;
//^^^^^^^^  {{Remove this "continue" statement or make it conditional}}
}

for (;;) {
  if (condition) {
    continue;
  }

  return 42; // OK
}

for (;;) {
  foo();
  return 42;
//^^^^^^  {{Remove this "return" statement or make it conditional}}
}
