//// [asyncFunctionDeclaration5_es6.ts]
async function foo(await): Promise<void> {
}

//// [asyncFunctionDeclaration5_es6.js]
function foo() {
    return __awaiter(this, void 0, void 0, function* () { });
}
await;
Promise < void  > {};
