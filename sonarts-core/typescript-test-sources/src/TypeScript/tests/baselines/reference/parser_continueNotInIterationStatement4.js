//// [parser_continueNotInIterationStatement4.ts]
TWO:
while (true){
  var x = () => {
    continue TWO;
  }
}


//// [parser_continueNotInIterationStatement4.js]
TWO: while (true) {
    var x = function () {
        continue TWO;
    };
}
