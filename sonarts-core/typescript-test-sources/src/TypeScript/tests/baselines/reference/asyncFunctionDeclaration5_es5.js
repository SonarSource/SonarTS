//// [asyncFunctionDeclaration5_es5.ts]
async function foo(await): Promise<void> {
}

//// [asyncFunctionDeclaration5_es5.js]
function foo() {
    return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/];
    }); });
}
await;
Promise < void  > {};
