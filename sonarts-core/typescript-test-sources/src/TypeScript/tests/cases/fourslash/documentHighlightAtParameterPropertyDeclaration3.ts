﻿/// <reference path='fourslash.ts'/>

// @Filename: file1.ts
//// class Foo {
////     // This is not valid syntax: parameter property can't be binding pattern
////     constructor(private [[|privateParam|]]: number,
////         public [[|publicParam|]]: string,
////         protected [[|protectedParam|]]: boolean) {
////
////         let localPrivate = [|privateParam|];
////         this.privateParam += 10;
////
////         let localPublic = [|publicParam|];
////         this.publicParam += " Hello!";
////
////         let localProtected = [|protectedParam|];
////         this.protectedParam = false;
////     }
//// }

verify.rangesWithSameTextAreDocumentHighlights();
