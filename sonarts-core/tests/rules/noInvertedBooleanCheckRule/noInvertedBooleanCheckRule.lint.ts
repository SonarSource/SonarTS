export function toCreateModule() {}

var x = foo();
if (!x) {}
if (x == 1) {}
if (!(x + 1)) {}
if (+(x == 1)) {}
if (!(x == 1)) {}
//  ^^^^^^^^^ {{Use the opposite operator ("!=") instead.}}
if (!(x != 1)) {}
//  ^^^^^^^^^ {{Use the opposite operator ("==") instead.}}
if (!(x === 1)) {}
//  ^^^^^^^^^^ {{Use the opposite operator ("!==") instead.}}
if (!(x !== 1)) {}
//  ^^^^^^^^^^ {{Use the opposite operator ("===") instead.}}

// https://github.com/SonarSource/typescript-test-sources/blob/master/src/TypeScript/src/compiler/core.ts#L2386
// This is a fast way of testing the following conditions:
//  pos === undefined || pos === null || isNaN(pos) || pos < 0;
if (!(pos >= 0)) {}
if (!(pos > 0)) {}
if (!(pos < 0)) {}
if (!(pos <= 0)) {}
