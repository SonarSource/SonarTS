/// <reference path='fourslash.ts' />

////if (true) {
////    if (false) {
////    }
////    else {
////    }
////    if (true) {
////    }
////    else {
////        /*1*/if (false)
////            /*2*/i/*3*/f (true)
////                var x = undefined;
////    }
////}
////else            if (null) {
////}
////else /* whar garbl */ if (undefined) {
////}
////else
////if (false) {
////}
////else { }


for (var i = 1; i <= test.markers().length; i++) {
    goTo.marker("" + i);

    verify.occurrencesAtPositionCount(1);
}