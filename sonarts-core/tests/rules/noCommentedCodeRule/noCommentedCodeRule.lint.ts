function ok_jsdoc() {
  /**
   * @return {String}
   */
}

function ok_linter_annotations() {

  /*jslint bitwise: false, browser: true, continue: false, devel: true, eqeq: false, evil: false, forin: false, newcap: false, nomen: false, plusplus: true, regexp: true, stupid: false, sub: false, undef: false, vars: false */

  /*jshint bitwise: false, curly: true, eqeqeq: true, forin: true, immed: true, latedef: true, newcap: true, noarg: true, noempty: false, nonew: true, plusplus: false, regexp: false, undef: true, strict: true, trailing: true, expr: true, regexdash: true, browser: true, jquery: true, onevar: true, nomen: true */

  /*global myGlobal: true */

}

function ok_text_containing_code_tokens() {

  // ====

  // ----

  // ++++

  // some text with semicolon at the end;

  // http://www.example.com/ = http://www.example.com/

  // labelName : id

  // foo(), bar();

  // continue

  // return blabla

  // break something

  // throw exception

  // throw exception;

  // labelName : id;


  //				break;
}

function ok_expression_without_semicolon() {
  // foo.bar

  // a + b

  // foo (see [123])

  // IE

  // shift

  // reduce
}

function ok_some_trivial_expressions() {

  //Object;

  //+ 10;

  //"gradientunscaled";
}

function noncompliant() {

  // [76:2-76:22] {{Remove this commented out code.}}

  // if (something) {}


  // [81:2-81:21] {{Remove this commented out code.}}

  // var object = {};


  // [86:2-86:24] {{Remove this commented out code.}}

  // return foo().bar();


  // [91:2-91:23] {{Remove this commented out code.}}

  // return foo().bar()


  // [96:2-96:22] {{Remove this commented out code.}}

  // throw foo().bar()


  // [101:2-104:8] {{Remove this commented out code.}}

  // // nested comment
  // foo(a, function(){
  //     doSmth();
  // });


  // [109:2-110:11] {{Remove this commented out code.}}

  // foo();
  // bar();
}

function empty_comments() {

  //

  /* */

  //
  //  // nested comment
  //
}

function ok_code_with_text() {
  // some text with some code is ok
  // if (condition) {
  // }


  /*
    some text with some code is ok
    if (condition) {
    }
  */
}

function unfinished_block() {
  // [140:2-142:23] {{Remove this commented out code.}}

  // if (condition) {
  //   while (condition) {
  //     doSomething();

  // [146:2-149:6] {{Remove this commented out code.}}

  //   while (condition) {
  //     doSomething();
  //   }
  // }
}

function ignore_a_single_open_closed_curly_brace() {

  // {
  
  // }

  // [160:2-160:7] {{Remove this commented out code.}}

  // }}

  // [164:2-165:6] {{Remove this commented out code.}}

  //   }
  // }
}

class Foo {
  public tail: any = null; // earliest
  public head: any = null; // latest
}

// foo
// bar
setTimeout(() => {}, 100)

// foo
/* tslint:disable:no-use-before-declare */
x;

export default 1;

export function toCreateModule() {}
