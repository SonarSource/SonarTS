/// <reference path='fourslash.ts'/>

////module modTest {
////    //Declare
////    export var modVar:number;
////    /*1*/
////
////    //Increments
////    modVar++;
////
////    class testCls{
////        /*2*/
////    }
////
////    function testFn(){
////        //Increments
////        modVar++;
////    }  /*3*/
/////*4*/
////    module testMod {
////    }
////}

goTo.eachMarker(() => verify.noReferences());
