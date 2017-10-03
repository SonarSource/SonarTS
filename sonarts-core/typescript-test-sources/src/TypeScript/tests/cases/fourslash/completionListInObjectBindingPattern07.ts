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
////var foo: J;
////var { property1: { /**/ } } = foo;

goTo.marker();
verify.completionListContains("propertyOfI_1");
verify.completionListContains("propertyOfI_2");
verify.not.completionListContains("property2");
verify.not.completionListAllowsNewIdentifier();