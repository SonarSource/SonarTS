/// <reference path='fourslash.ts'/>

////interface I {
////    propertyOfI_1: number;
////    propertyOfI_2: string;
////}
////interface J {
////    property1: I;
////    property2: string;
////}
////
////var foo: J[];
////var [{ property1: { propertyOfI_1, }, /*1*/ }, { /*2*/ }] = foo;

goTo.marker("1");
verify.completionListContains("property2");
verify.not.completionListContains("property1");
verify.not.completionListContains("propertyOfI_2");
verify.not.completionListContains("propertyOfI_1");
verify.not.completionListAllowsNewIdentifier();

goTo.marker("2");
verify.completionListContains("property1");
verify.completionListContains("property2");
verify.not.completionListAllowsNewIdentifier();