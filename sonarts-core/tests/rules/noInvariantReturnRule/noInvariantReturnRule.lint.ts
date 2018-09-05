  function foo(a: number) {
//^^^^^^^^ {{TODO: add message}}
    if (a == 1) {
        return 42;
    }
    return 42;
}

  function strings(a: number) {
//^^^^^^^^ {{TODO: add message}}
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

function withThrowAndExplicitReturn(cond: boolean) {
    if (cond) {
        throw "";
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
//                          ^^  {{TODO: add message}}

  function* inconsistentGenerator(p) {
//^^^^^^^^  {{TODO: add message}}
    let i = 0
    while (i < 10) {
        return "foo";
    }
    return "foo";
}

class A {
    inconsistentMethod(p) {
  //^^^^^^^^^^^^^^^^^^  {{TODO: add message}}
        if (p) {
            return "foo";
        }
        return "foo";
    }

    *inconsistentGenerator(p) {
 //  ^^^^^^^^^^^^^^^^^^^^^  {{TODO: add message}}
        if (p) {
            return "foo";
        }
        return "foo";
    }

    private _value: number;

    get value(): number {
  //    ^^^^^  {{TODO: add message}}
        if (this._value) {
            return "a";
        } else {
            return "a";
        }
    }

}