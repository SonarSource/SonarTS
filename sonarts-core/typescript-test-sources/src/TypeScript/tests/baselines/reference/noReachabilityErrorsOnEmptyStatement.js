//// [noReachabilityErrorsOnEmptyStatement.ts]
function foo() {
    return 1;;
}

//// [noReachabilityErrorsOnEmptyStatement.js]
function foo() {
    return 1;
    ;
}
