/// <reference path='fourslash.ts'/>

////class clsOverload { constructor(); constructor(test: string); constructor(test?: string) { } }
////var x = new clsOverload/*beforeOpenParen*/()/*afterCloseParen*/;

goTo.marker('beforeOpenParen');
verify.not.signatureHelpPresent();

goTo.marker('afterCloseParen');
verify.not.signatureHelpPresent();