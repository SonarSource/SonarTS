﻿/// <reference path="fourslash.ts" />

////function foo(x: string, y: number, z: boolean) {
////    /*1*/
////

goTo.marker("1");

verify.completionListContains("foo");
verify.completionListContains("x");
verify.completionListContains("y");
verify.completionListContains("z");