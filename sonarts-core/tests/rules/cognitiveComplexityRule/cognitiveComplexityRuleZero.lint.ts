export function toCreateModule() {}

function zero_complexity(){
}

interface MyTestInterface {
  doStuff(value: string): void;
}

function with_nested_class() {
  let myClass = class {
    public simple_complexity(condition: boolean): void {
      //   ^^^^^^^^^^^^^^^^^ {{Refactor this method to reduce its Cognitive Complexity from 1 to the 0 allowed.}} [[cost:1]]
          if (condition) { }
      //  ^^ < {{+1}}
    }
  }
}

class MyTestClass {

  private _field: string;

  constructor(condition: boolean) {
//^^^^^^^^^^^ {{Refactor this constructor to reduce its Cognitive Complexity from 1 to the 0 allowed.}} [[cost:1]]
    if (condition) { }
  }

  get field(): string {
//    ^^^^^ {{Refactor this accessor to reduce its Cognitive Complexity from 1 to the 0 allowed.}} [[cost:1]]
    if (this._field) {
      return this._field;
    }
    return "";
  }

  set field(newField: string) {
//    ^^^^^ {{Refactor this accessor to reduce its Cognitive Complexity from 1 to the 0 allowed.}} [[cost:1]]
    if (newField !== this._field) {
      this._field = newField;
    }
  }

  public zero_complexity(): void { }

  public simple_complexity(condition: boolean): void {
//       ^^^^^^^^^^^^^^^^^ {{Refactor this method to reduce its Cognitive Complexity from 1 to the 0 allowed.}} [[cost:1]]
    if (condition) { }
  }
}

  function if_else_complexity(condition: boolean) {
//^^^^^^^^ {{Refactor this function to reduce its Cognitive Complexity from 3 to the 0 allowed.}} [[cost:3]]
    if (condition) {        // +1
    } else if (condition) { // +1
    } else {                // +1
    }
}

  function else_nesting(condition: boolean) {
//^^^^^^^^ {{Refactor this function to reduce its Cognitive Complexity from 4 to the 0 allowed.}} [[cost:4]]
  if (condition) {        // +1
//^^ < {{+1}}   
  } else {                // +1 (nesting level +1)

    if (condition) {}     // +2
  //^^ < {{+2 (incl. 1 for nesting)}}   
  }
}

  function else_nested(condition: boolean) {
//^^^^^^^^ {{Refactor this function to reduce its Cognitive Complexity from 4 to the 0 allowed.}} [[cost:4]]
  if (condition) {        // +1 (nesting level +1)
    if (condition) {      // +2
    } else {              // +1
    }
  }
}

  function if_nested(condition: boolean) {
//^^^^^^^^ {{Refactor this function to reduce its Cognitive Complexity from 6 to the 0 allowed.}} [[cost:6]]
  if (condition)       // +1 (nesting level +1)
    if (condition)     // +2 (nesting level +1)
      if (condition) { // +3
      }
}

  function else_if_nesting(condition: boolean) {
//^^^^^^^^ {{Refactor this function to reduce its Cognitive Complexity from 4 to the 0 allowed.}} [[cost:4]]
  if (condition) {           // +1
  } else if (condition)      // +1 (nesting level +1)
    if (condition) {         // +2
    }
}

  function switch_statement(condition: boolean, expr: string) {
//^^^^^^^^ {{Refactor this function to reduce its Cognitive Complexity from 6 to the 0 allowed.}} [[cost:6]]
  if (condition) {         // +1 (nesting level +1)
    switch (expr) {        // +2 (nesting level +1)
     case "1":
        if (condition) {}  // +3
        break;
     case "2":
        break;
     default:
        foo();
    }
  }
}

  function loops_complexity(condition: boolean, obj: string[]) {
//^^^^^^^^ {{Refactor this function to reduce its Cognitive Complexity from 17 to the 0 allowed.}} [[cost:17]]
  while (condition) {                // +1 (nesting level +1)
    if (condition) { }               // +2
  }

  do {                               // +1 (nesting level +1)
    if (condition) { }               // +2
  } while (condition);

  for (i = 0; i < length; i++) {     // +1 (nesting level +1)
    if (condition) { }               // +2
    for (i = 0; i < length; i++) { } // +2
  }

  for (var x in obj) {               // +1 (nesting level +1)
    if (condition) { }               // +2
  }

  for (var x of obj) {               // +1 (nesting level +1)
    if (condition) { }               // +2
  }
}

  function try_catch(condition: boolean) {
//^^^^^^^^ {{Refactor this function to reduce its Cognitive Complexity from 5 to the 0 allowed.}} [[cost:5]]
  try {
    if (condition) { }   // +1
  } catch (someError) {  // +1 (nesting level +1)
    if (condition)  { }  // +2
  } finally {
    if (condition) { }   // +1
  }
}

  function try_finally(condition: boolean) {
//^^^^^^^^ {{Refactor this function to reduce its Cognitive Complexity from 2 to the 0 allowed.}} [[cost:2]]
  try {
    if (condition) { } // +1
  } finally {
    if (condition) { } // +1
  }
}

  function nested_try_catch(condition: boolean) {
//^^^^^^^^ {{Refactor this function to reduce its Cognitive Complexity from 3 to the 0 allowed.}} [[cost:3]]
  try {
    if (condition) {        // +1 (nesting level +1)
      try {}
      catch (someError) { } // +2
    }
  } finally { }
}


  function jump_statements_no_complexity(condition: boolean) {
//^^^^^^^^ {{Refactor this function to reduce its Cognitive Complexity from 6 to the 0 allowed.}} [[cost:6]]
  if (condition)         // +1
    return;
  else if (condition)    // +1
    return 42;

  label:
  while (condition) {    // +1 (nesting level +1)
    if (condition)       // +2
      break;
    else if (condition)  // +1
      continue;
  }
}

  function break_continue_with_label(condition: boolean) {
//^^^^^^^^ {{Refactor this function to reduce its Cognitive Complexity from 3 to the 0 allowed.}} [[cost:3]]
  label:
  while (condition) { // +1
      break label;    // +1
      continue label; // +1
  }
}

  function recursion(condition: boolean): number {
//^^^^^^^^ {{Refactor this function to reduce its Cognitive Complexity from 2 to the 0 allowed.}} [[cost:2]]
  if (condition)
    return 42;
  else
    return recursion(condition);
}

function nesting_func_no_complexity(condition: boolean) {  // Ok
  function nested_func() {
//^^^^^^^^ {{Refactor this function to reduce its Cognitive Complexity from 1 to the 0 allowed.}} [[cost:1]]
    if (condition) { }   // +1
  }
}

function nesting_class_no_complexity(condition: boolean) {  // Ok
  class MyInnerClass {
    private nested_func() {
//          ^^^^^^^^^^^ {{Refactor this method to reduce its Cognitive Complexity from 1 to the 0 allowed.}} [[cost:1]]
      if (condition) { }   // +1
    }
  }
}

  function nesting_func_with_complexity(condition: boolean) {
//^^^^^^^^ {{Refactor this function to reduce its Cognitive Complexity from 1 to the 0 allowed.}} [[cost:1]]
  if (condition) { }         // +1

  // excluded from parent but still individually evaluated
  function nested_func() {
//^^^^^^^^ {{Refactor this function to reduce its Cognitive Complexity from 1 to the 0 allowed.}} [[cost:1]]
    if (condition) { }       // +1
  }
}

  function nesting_func_with_function_expression(condition: boolean) {
//^^^^^^^^ {{Refactor this function to reduce its Cognitive Complexity from 5 to the 0 allowed.}} [[cost:5]]
  if (condition) { }                       // +1

  // function expression are counted as part of the method
  let function_expression = function() {   // (nesting level +1)
    if (condition) { }                     // +2
  }

  let lambda_expression = (x:boolean) => { // (nesting level +1)
    if (x) { }                             // +2
  }
}

  function conditional_expression(condition: boolean, trueValue: string, falseValue: string): string {
//^^^^^^^^ {{Refactor this function to reduce its Cognitive Complexity from 1 to the 0 allowed.}} [[cost:1]]
  return condition ? trueValue : falseValue;
}

  function nested_conditional_expression(condition1: boolean, condition2: boolean, condition3: boolean, trueValue: string, falseValue: string) {
//^^^^^^^^ {{Refactor this function to reduce its Cognitive Complexity from 11 to the 0 allowed.}} [[cost:11]]
  let x;
  x = condition1 ? (condition2 ? trueValue : falseValue) : falseValue;                            // +3
  x = condition1 ? trueValue : (condition2 ? trueValue : falseValue);                             // +3
  x = condition1 ? (condition2 ? trueValue : falseValue) : (condition3 ? trueValue : falseValue); // +5
}

  function and_or() {
//^^^^^^^^ {{Refactor this function to reduce its Cognitive Complexity from 12 to the 0 allowed.}} [[cost:12]]
  foo(1 && 2 && 3 && 4); // +1

  foo((1 && 2) && (3 && 4)); // +1

  foo(((1 && 2) && 3) && 4); // +1

  foo(1 && (2 && (3 && 4))); // +1

  foo(1 || 2 || 3 || 4); // +1

  foo(1 && 2
        || 3 || 4); // +2

  foo(1 && 2
        || 3
        && 4); // +3

  foo(1 && 2 &&
        !(3 && 4)); // +2
}

  function nested_function_expression_with_boolean() {
//^^^^^^^^ {{Refactor this function to reduce its Cognitive Complexity from 1 to the 0 allowed.}} [[cost:1]]
  let foo = function(a: boolean, b:boolean) {
    return a && b; // +1
  };
}
