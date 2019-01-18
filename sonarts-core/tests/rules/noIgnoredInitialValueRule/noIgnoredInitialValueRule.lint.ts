export function toCreateModule() {}

function parameterNok(p: number) {
//                    ^  {{Introduce a new variable or use its initial value before reassigning "p".}}
  p = 42;
  return p;
}

function forLoopsNok(strings: string[]) {
  for (let s in strings) {
//         ^ {{Introduce a new variable or use its initial value before reassigning "s".}}
    s = "hello world";
    console.log(s);
  }
  for (let s of strings) {
//         ^ {{Introduce a new variable or use its initial value before reassigning "s".}}
    s = "hello world";
    console.log(s);
  }
}

function parameterWrappedNok({p}) {
  //                          ^  {{Introduce a new variable or use its initial value before reassigning "p".}}
    p = 42;
    return p;
}
  
function exceptionNok() {
  try {
  } catch(e) {
//        ^ {{Introduce a new variable or use its initial value before reassigning "e".}}
    e = 42;
    throw e;
  }
}

// global

try {
} catch(e) {
//      ^ {{Introduce a new variable or use its initial value before reassigning "e".}}
  e = 42;
  throw e;
}

for (let s in strings) {
//       ^ {{Introduce a new variable or use its initial value before reassigning "s".}}
  s = "";
  console.log(s);
}
  
for (let s in strings) {
  console.log(s);
}

function parameterUsedConditionally(p: number, cond: boolean) {
  if (cond) {
    p = 42;
  }
  return p;
}

function unusedParameter(p: number) {
  return 42;
}


function unusedException() {
  try {
  } catch(e) {
    throw 42;
  }
}

function forLoopsOk(strings: string[]) {
  for (const s in strings) {
    console.log(s);
  }
  for (let s of strings) {
    console.log(42);
  }
}

function usedInsideNestedFunction(p: number) {
  return ()=>{
    console.log(p);
  };
}

class A {
  constructor(protected _prop: Immutable.Map<Foo, Array<number>>) {
  }

  get prop(): number {
    return this._prop;
  }
}

function parameterUsedInParameterClause(a: number, b = a + 2) {
  console.log(b);
}

function parameterUsedInNestedClass(p: number) {
  @NgModule({providers: p})
  class SomeModule {
  }

  return SomeModule;
}

function parameterUsedInNestedClassField(x: number) {
  return class A {
    static bar = x + 1;
  }
}

function parameterIsUsedInReturnType(_value: any): _value is number {
  throw new Error('Unimplemented.');
}
