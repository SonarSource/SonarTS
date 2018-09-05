  function foo(a: number) {
//^^^^^^^^ {{Refactor this method to not always return the same value.}}
    if (a == 1) {
        return 42;
    }
    return 42;
}

  function strings(a: number) {
//^^^^^^^^ {{Refactor this method to not always return the same value.}}
    if (a == 1) {
        return "foo";
    }
    return "foo";
}

  function strings2(a: number) {
    const c = "foo";
    if (a == 1) {
        return c;
    }
    c += "aa";
    return c;
}

function oneReturnValue() {
    return 1;
}

function withImplicitReturn(p: boolean) {
    if (p) {
        return 2;
    }
}

function differentValues(p: boolean) {
    if (p) {
        return 10;
    } else {
        return 11;
    }
}

function allImplicitReturns(p: boolean) {
    if (p) {
        foo();
    } else {
        return;
    }

    function foo() { }
}

function explicitUndefinedDeclaration(p: boolean): number | undefined {
    if (p) {
        return 1;
    }
}

function empty() {

}

function explicitUndefinedDeclaration1(p: boolean): undefined {
    if (p) {
        return void 0;
    }
}

function explicitVoidDeclaration1(p: boolean): void | number {
    if (p) {
        return 0;
    }
}

function explicitVoidDeclaration(p: boolean): void {
    if (p) {
        return void 0;
    }

}

function withThrowAndExplicitReturn(cond: boolean, cond2: boolean) {
    if (cond) {
        throw 42;
    }
    if (cond2) {
        return 42;
    }
    return 42;
}

function withThrowAndImplicitReturn(cond: boolean) {
    if (cond) {
        throw "";
    }
    console.log("bar");
}

var arrowWithExpressionBody = (p) => p ? true : false;

var inconsistentArrow = (p) => { if (p) { return "foo"; } return "foo"; };
//                          ^^  {{Refactor this method to not always return the same value.}}

  function* inconsistentGenerator(p) {
//^^^^^^^^  {{Refactor this method to not always return the same value.}}
    let i = 0
    while (i < 10) {
        return "foo";
    }
    return "foo";
}

class A {
    inconsistentMethod(p) {
  //^^^^^^^^^^^^^^^^^^  {{Refactor this method to not always return the same value.}}
        if (p) {
            return "foo";
        }
        return "foo";
    }

    *inconsistentGenerator(p) {
 //  ^^^^^^^^^^^^^^^^^^^^^  {{Refactor this method to not always return the same value.}}
        if (p) {
            return "foo";
        }
        return "foo";
    }

    private _value: number;

    get value(): number {
  //    ^^^^^  {{Refactor this method to not always return the same value.}}
        if (this._value) {
            return "a";
        } else {
            return "a";
        }
    }

}