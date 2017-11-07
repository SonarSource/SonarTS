#!/usr/bin/env node
var testFile = process.argv[2];

var result = [{
    "filepath": testFile,
//    "issues": [
//        {
//            failure: "some message",
//            startPosition: {line: 1, character: 5},
//            endPosition: {line: 1, character: 6},
//            name: testFile,
//            ruleName: "no-unconditional-jump"
//        }
//    ],
    "highlights": [
    ],
    "cpdTokens": [
    ],

//    "ncloc":[55, 77, 99],
    "commentLines":[24, 42],
    "nosonarLines":[24],
    "executableLines": [5, 7],
    "statements":100,
//    "functions":10,
    "classes":1
}];

process.stdin.on('data', function () {
 // needed for 'end' to be sent
});

process.stdin.on('end', function () {
    process.stdout.write(JSON.stringify(result));
});
