/// <reference path='fourslash.ts'/>

////function foo1<T>(x: number, callback: (y1: T) => number) { }
////function foo2<T>(x: number, callback: (y2: T) => number) { }
////function foo3<T>(x: number, callback: (y3: T) => number) { }
////function foo4<T>(x: number, callback: (y4: T) => number) { }
////function foo5<T>(x: number, callback: (y5: T) => number) { }
////function foo6<T>(x: number, callback: (y6: T) => number) { }
////function foo7<T>(x: number, callback: (y7: T) => number) { }
//// IDE shows the results on the right of each line, fourslash says different
////foo1(/*1*/               // signature help shows y as T
////foo2(1,/*2*/             // signature help shows y as {}
////foo3(1, (/*3*/           // signature help shows y as T
////foo4<string>(1,/*4*/     // signature help shows y as string
////foo5<string>(1, (/*5*/   // signature help shows y as T
////foo6(1, </*6*/           // signature help shows y as {}
////foo7(1, <string>(/*7*/   // signature help shows y as T

goTo.marker('1');
verify.currentSignatureHelpIs('foo1<T>(x: number, callback: (y1: T) => number): void');

// goTo.marker('2');
// verify.currentSignatureHelpIs('foo2(x: number, callback: (y2: {}) => number): void');

goTo.marker('3');
verify.currentSignatureHelpIs('foo3<T>(x: number, callback: (y3: T) => number): void');

// goTo.marker('4');
// verify.currentSignatureHelpIs('foo4(x: number, callback: (y4: string) => number): void');

goTo.marker('5');
verify.currentSignatureHelpIs('foo5<T>(x: number, callback: (y5: T) => number): void');

goTo.marker('6');
// verify.currentSignatureHelpIs('foo6(x: number, callback: (y6: {}) => number): void');
edit.insert('string>(null,null);'); // need to make this line parse so we can get reasonable LS answers to later tests

goTo.marker('7');
verify.currentSignatureHelpIs('foo7<T>(x: number, callback: (y7: T) => number): void');
