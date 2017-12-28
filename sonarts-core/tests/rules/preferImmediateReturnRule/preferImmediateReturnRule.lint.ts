function foo(x?: any): any {}

function var_returned() {
  var x = 42;
  //      ^^ {{Immediately return this expression instead of assigning it to the temporary variable "x".}}
  return x;
}

function let_returned() {
  let x = 42;
  //      ^^ {{Immediately return this expression instead of assigning it to the temporary variable "x".}}
  return x;
}

function const_returned() {
  const x = 42;
  //        ^^ {{Immediately return this expression instead of assigning it to the temporary variable "x".}}
  return x;
}

function code_before_declaration() {
  foo();
  var x = 42;
  //      ^^ {{Immediately return this expression instead of assigning it to the temporary variable "x".}}
  return x;
}

function thrown_nok() {
  const x = new Error();
  //        ^^^^^^^^^^^ {{Immediately throw this expression instead of assigning it to the temporary variable "x".}}
  throw x;
}

function thrown_ok() {
  throw new Error();
}

function thrown_expression() {
  const x = new Error();
  throw foo(x);
}

function thrown_different_variable(y: any) {
  const x = new Error();
  throw y;
}

function code_between_declaration_and_return() {
  let x = 42;
  foo();
  return x;
}

function return_expression() {
  let x = 42;
  return x + 5;
}

function return_without_value() {
  let x = 42;
  return;
}

function not_return_statement() {
  let x = 42;
  foo(x);
}

function no_init_value() {
  let x;
  return x;
}

function pattern_declared() {
  let { x } = foo();
  return x;
}

function two_variables_declared() {
  let x = 42,
    y;
  return x;
}

function different_variable_returned(y: any) {
  let x = 42;
  return y;
}

function only_return() {
  return 42;
}

function one_statement() {
  foo();
}

function empty_block() {}

function different_blocks() {
  if (foo) {
    let x = foo();
    //      ^^^^^ {{Immediately return this expression instead of assigning it to the temporary variable "x".}}
    return x;
  }

  try {
    let x = foo();
    //      ^^^^^ {{Immediately return this expression instead of assigning it to the temporary variable "x".}}
    return x;
  } catch (e) {
    let x = foo();
    //      ^^^^^ {{Immediately return this expression instead of assigning it to the temporary variable "x".}}
    return x;
  } finally {
    let x = foo();
    //      ^^^^^ {{Immediately return this expression instead of assigning it to the temporary variable "x".}}
    return x;
  }
}

var arrow_function_ok = (a: any, b: any) => {
  return a + b;
};

var arrow_function_no_block = (a: any, b: any) => a + b;

function variable_is_used() {
  var bar = {
    // OK
    doSomethingElse(p: any) {},
    doSomething() {
      bar.doSomethingElse(1);
    },
  };
  return bar;
}

function two_declarations(a: any) {
  if (a) {
    let x = foo();
    //      ^^^^^ {{Immediately return this expression instead of assigning it to the temporary variable "x".}}
    return x;
  } else {
    let x = bar();
    return x + 42;
  }
}

function homonymous_is_used() {
  const bar = {
    doSomethingElse(p: any) {
      var bar = 2;
      return p + bar;
    },
    doSomething() {
      return this.doSomethingElse(1);
    },
  };
  // [151:14-159:3] {{Immediately return this expression instead of assigning it to the temporary variable "bar".}}
  return bar;
}

function inside_switch(x: any) {
  switch (x) {
    case 1:
      const y = 3;
      //        ^ {{Immediately return this expression instead of assigning it to the temporary variable "y".}}
      return y;
    default:
      const z = 2;
      //        ^ {{Immediately return this expression instead of assigning it to the temporary variable "z".}}
      return z;
  }
}

export default 1;
