//// [templateStringWithEmbeddedTemplateString.ts]
var x = `123${ `456 ${ " | " } 654` }321 123${ `456 ${ " | " } 654` }321`;

//// [templateStringWithEmbeddedTemplateString.js]
var x = "123" + "456 " + " | " + " 654" + "321 123" + "456 " + " | " + " 654" + "321";
