//// [FunctionDeclaration13_es6.ts]
function * foo() {
   // Legal to use 'yield' in a type context.
   var v: yield;
}


//// [FunctionDeclaration13_es6.js]
function* foo() {
    // Legal to use 'yield' in a type context.
    var v;
}
