//// [taggedTemplateStringsWithMultilineTemplateES6.ts]
function f(...args: any[]): void {
}

f `
\

`;

//// [taggedTemplateStringsWithMultilineTemplateES6.js]
function f(...args) {
}
f `
\

`;
