function f1(flag?: boolean) {}
//          ^^^^^^^^^^^^^^{{Provide default value for this parameter.}}
function f2(flag: boolean = false) {} // OK

function f3(flag: boolean | undefined) {}
//          ^^^^^^^^^^^^^^^^^^^^^^^^^{{Provide default value for this parameter.}}

function f4(flag: boolean | undefined = true) { } // OK

function f5(flag: boolean | string) { } // OK

function f6(flag: boolean & string) { } // OK
