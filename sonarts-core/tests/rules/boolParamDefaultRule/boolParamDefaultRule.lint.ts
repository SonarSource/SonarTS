export function toCreateModule() {}

function f1(flag?: boolean) {}
//          ^^^^^^^^^^^^^^{{Provide a default value for 'flag' so that the logic of the function is more evident when this parameter is missing. Consider defining another function if providing default value is not possible.}}
function f2(flag: boolean = false) {} // OK

function f3(flag: boolean | undefined) {}
//          ^^^^^^^^^^^^^^^^^^^^^^^^^{{Provide a default value for 'flag' so that the logic of the function is more evident when this parameter is missing. Consider defining another function if providing default value is not possible.}}

function f4(flag: boolean | undefined = true) { } // OK

function f5(flag: boolean | string) { } // OK

function f6(flag: boolean & string) { } // OK

function f7(flag?: string) { } // OK

interface MyInterface {
  interfaceMethod(p?: boolean): void // OK
}

class MyClass {
  classMethod(p?: boolean): void {}
//            ^^^^^^^^^^^ {{Provide a default value for 'p' so that the logic of the function is more evident when this parameter is missing. Consider defining another function if providing default value is not possible.}} 
}
