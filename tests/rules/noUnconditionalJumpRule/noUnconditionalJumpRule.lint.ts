// tslint:disable

while(foo()) {
  bar();
  if (baz()) {
    break;
  }
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

for(p of obj) {
  bar();
  break;
//^^^^^  {{Remove this "break" statement or make it conditional}}
}

while(foo()) {
  if (bar()) {
    break;
  }
  baz();
  break;
//^^^^^  {{Remove this "break" statement or make it conditional}}
}


while(foo()) {
  if (bar()) {
    continue;
  }
  baz();
  break; // Compliant: the loop can execute more than once
}

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
  return 42; // FN
//^^^^^^  {{Remove this "return" statement or make it conditional}}
}
