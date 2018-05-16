export function foo(p1: number, p2?: number, p3 = 42) {
}

foo(1, 2, 3);
foo(1, 2);
foo(1);
foo(1, 2, 42); // OK when default value is passed
foo(1, 2, [undefined].length);

foo(1, 2, undefined);
//        ^^^^^^^^^ {{Remove this redundant "undefined".}}

foo(1, undefined, undefined);
//                ^^^^^^^^^ {{Remove this redundant "undefined".}}

foo(1, undefined);
//     ^^^^^^^^^ {{Remove this redundant "undefined".}}



let funcExprWithOneParameter = function(p = 42){ }
funcExprWithOneParameter(undefined);
//                       ^^^^^^^^^ {{Remove this redundant "undefined".}}
funcExprWithOneParameter(1);


unknownCalled(1, undefined);

function bar() {}
bar(undefined); // compile error but we should not explode
