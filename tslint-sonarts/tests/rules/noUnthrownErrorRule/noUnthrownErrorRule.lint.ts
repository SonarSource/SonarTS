// OK
foo(new Error());
foo(TypeError);
throw new Error();
new LooksLikeAnError().doSomething();

// NOK

  new Error();
//^^^^^^^^^^^        {{Throw this error or remove this useless statement}}

  new TypeError();
//^^^^^^^^^^^^^^^    {{Throw this error or remove this useless statement}}

  new MyError();
//^^^^^^^^^^^^^      {{Throw this error or remove this useless statement}}

  new A.MyError();
//^^^^^^^^^^^^^^^    {{Throw this error or remove this useless statement}}

new A(function () {
  new SomeError();
//^^^^^^^^^^^^^^^    {{Throw this error or remove this useless statement}}
});

  new MyException();
//^^^^^^^^^^^^^^^^^    {{Throw this error or remove this useless statement}}