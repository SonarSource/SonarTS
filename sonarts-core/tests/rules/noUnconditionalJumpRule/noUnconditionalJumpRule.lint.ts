export function toCreateModule() {}

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
//^^^^^  {{Refactor this loop; it's executed only once}}
  bar();
  break;
}

while(foo()) {
  bar();
  continue; // OK, covered by no-redundant-jump
}

  while(foo()) {
//^^^^^  {{Refactor this loop; it's executed only once}}
  bar();
  throw x;
}

  while(foo())
//^^^^^  {{Refactor this loop; it's executed only once}}
  break;

function f() {
  while(foo()) {
    bar();
    if (baz()) {
      return;
    }
  }
  while(foo()) {
//^^^^^  {{Refactor this loop; it's executed only once}}    
    bar();
    return;
  }
}

  do {
//^^  {{Refactor this loop; it's executed only once}}  
  bar();
  break;
} while (foo())

  for (i = 0; foo(); i++) {
//^^^  {{Refactor this loop; it's executed only once}}  
  bar();
  break;
}

for (p in obj) {
  bar();
  break; // Compliant: often used to check whether an object is "empty"
}

for (p in obj) {
  while(true) {
//^^^^^  {{Refactor this loop; it's executed only once}}   
    bar();
    break;
  }
}

for (p in obj) {
  foo();
  continue; // OK, covered by no-redundant-jump
}

  for(p of arr) {
//^^^  {{Refactor this loop; it's executed only once}}   
  bar();
  break;
}

for(p of arr) {
  return p;  // Compliant: used to return the first element of an array
}

  while(foo()) {
//^^^^^  {{Refactor this loop; it's executed only once}}
  if (bar()) {
    break;
//  ^^^^^ < {{loop is broken here.}}
  }
  baz();
  break;
//^^^^^  < {{loop is broken here.}}
}

if (cond()) {
  while(foo()) {
//^^^^^  {{Refactor this loop; it's executed only once}}    
    break;
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
  continue; // OK, covered by no-redundant-jump
}

for (i = 0; foo(); i++) {
  if (bar()) {
    continue;
  }
  baz();
  break; // Compliant
}

  for (i = 0; foo();) {
//^^^  {{Refactor this loop; it's executed only once}}  
  baz();
  break;
}

for (i = 0; foo(); i++) {
  baz();
  continue; // OK, covered by no-redundant-jump
}

for (;;) {
  if (condition) {
    continue;
  }

  return 42; // OK
}

  for (;;) {
//^^^  {{Refactor this loop; it's executed only once}}  
  foo();
  return 42;
}



  while (foo()) {
//^^^^^ {{Refactor this loop; it's executed only once}}
  if (bar()) {
    doSomething();
    break;
//  ^^^^^ < {{loop is broken here.}}
  } else {
    doSomethingElse();
    break;
//  ^^^^^ < {{loop is broken here.}}
  }
}

function twoReturns() {
  while (foo()) {
//^^^^^ {{Refactor this loop; it's executed only once}}
    if (bar()) {
      return 42;
    } else {
      return 0;
    }
  }
}

function tryCatch() {
  while (cond()) {
    try {
      doSomething();
    } catch (e) {
      continue;
    }

    doSomethingElse();
  }
}