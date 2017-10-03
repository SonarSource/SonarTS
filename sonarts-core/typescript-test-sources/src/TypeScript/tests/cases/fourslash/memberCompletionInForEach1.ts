/// <reference path='fourslash.ts'/>

////var x: string[] = [];
////x.forEach(function (y) { y/*1*/
////x.forEach(y => y/*2*/

goTo.marker('1');
edit.insert('.');
verify.completionListContains('trim');
verify.completionListCount(21);
edit.insert('});'); // need the following lines to not have parse errors in order for completion list to appear

goTo.marker('2');
edit.insert('.');
verify.completionListContains('trim');
verify.completionListCount(21);
