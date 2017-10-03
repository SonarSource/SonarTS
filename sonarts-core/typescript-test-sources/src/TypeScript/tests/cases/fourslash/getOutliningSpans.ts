/// <reference path="fourslash.ts"/>

////// interface 
////interface IFoo[| {
////    getDist(): number;
////}|]
////
////// class members
////class Foo[| {
////    constructor()[| {
////    }|]
////
////    public foo(): number[| {
////        return 0;
////    }|]
////
////    public get X()[| {
////        return 1;
////    }|]
////
////    public set X(v: number)[| {
////    }|]
////
////    public member = function f()[| {
////
////    }|]
////}|]
////switch(1)[| {
//// case 1: break;
////}|]
////
////var array =[| [
////    1,
////    2
////]|]
////
////// modules
////module m1[| {
////    module m2[| { }|]
////    module m3[| {
////        function foo()[| {
////
////        }|]
////
////        interface IFoo2[| {
////
////        }|]
////
////        class foo2 implements IFoo2[| {
////
////        }|]
////    }|]
////}|]
////
////// function declaration
////function foo(): number[| {
////    return 0;
////}|]
////
////// function expressions
////(function f()[| {
////
////}|])
////
////// trivia handeling
////class ClassFooWithTrivia[| /*  some comments */ 
////   /* more trivia */ {
////    
////
////    /*some trailing trivia */
////}|] /* even more */
////
////// object literals
////var x =[|{
////  a:1,
////  b:2,
////  get foo()[| {
////    return 1;
////  }|]
////}|]
//////outline with deep nesting
////module m1[|{
////    module m2[| {
////        module m3[| {
////            module m4[| {
////                module m5[| {
////                    module m6[| {
////                        module m7[| {
////                            module m8[| {
////                                module m9[| {
////                                    module m10[| {
////                                        module m11 {
////                                            module m12 {
////                                                export interface IFoo {
////                                                }
////                                            }
////                                        }
////                                    }|]
////                                }|]
////                            }|]
////                        }|]
////                    }|]
////                }|]
////            }|]
////        }|]
////    }|]
////}|]
////
//////outline after a deeply nested node
////class AfterNestedNodes[| {
////}|]

verify.outliningSpansInCurrentFile(test.ranges());
