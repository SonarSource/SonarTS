/// <reference path='fourslash.ts' />

////[|if|] (true) {
////    if (false) {
////    }
////    else {
////    }
////    if (true) {
////    }
////    else {
////        if (false)
////            if (true)
////                var x = undefined;
////    }
////}
////[|else            i/**/f|] (null) {
////}
////[|else|] /* whar garbl */ [|if|] (undefined) {
////}
////[|else|]
////[|if|] (false) {
////}
////[|else|] { }

verify.rangesAreOccurrences(false);

goTo.marker();
for (const range of test.ranges()) {
    verify.occurrencesAtPositionContains(range, false);
}
