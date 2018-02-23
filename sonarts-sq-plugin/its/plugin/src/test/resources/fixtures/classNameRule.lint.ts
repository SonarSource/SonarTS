class ValidClassName {

}

class invalidClassName {
//    ^^^^^^^^^^^^^^^^ {{Class name must be in pascal case}}
}

class Another_Invalid_Class_Name {
//    ^^^^^^^^^^^^^^^^^^^^^^^^^^ {{Class name must be in pascal case}}
}

export default class {
  // should not fail
}

// anonymous class expression
var foo = class {};
var bar = class invalidName {}
//              ^^^^^^^^^^^ {{Class name must be in pascal case}}

interface someInterface {}
//        ^^^^^^^^^^^^^ {{Class name must be in pascal case}}
interface SomeInterface {}
