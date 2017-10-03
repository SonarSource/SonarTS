//// [stringLiteralTypesWithTemplateStrings02.ts]
let abc: "AB\r\nC" = `AB
C`;
let de_NEWLINE_f: "DE\nF" = `DE${"\n"}F`;

//// [stringLiteralTypesWithTemplateStrings02.js]
var abc = "AB\nC";
var de_NEWLINE_f = "DE" + "\n" + "F";


//// [stringLiteralTypesWithTemplateStrings02.d.ts]
declare let abc: "AB\r\nC";
declare let de_NEWLINE_f: "DE\nF";
