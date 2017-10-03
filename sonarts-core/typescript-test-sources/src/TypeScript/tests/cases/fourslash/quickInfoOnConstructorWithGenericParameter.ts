/// <reference path='fourslash.ts' />

////interface I {
////    x: number;
////}
////class Foo<T> {
////    y: T;
////}
////class A {
////    foo() { }
////}
////class B extends A {
////    constructor(a: Foo<I>, b: number) {
////        super();
////    }
////}
////var x = new /*2*/B(/*1*/

goTo.marker("1");
verify.currentSignatureHelpIs("B(a: Foo<I>, b: number): B");
edit.insert("null,");
verify.currentSignatureHelpIs("B(a: Foo<I>, b: number): B");
edit.insert("10);");

verify.quickInfoAt("2", "constructor B(a: Foo<I>, b: number): B");
