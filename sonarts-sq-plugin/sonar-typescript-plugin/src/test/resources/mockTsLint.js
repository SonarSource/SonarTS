#!/usr/bin/env node

var result = [{
    "filepath": process.argv[2],
    "issues": [
        {
            failure: "some message",
            startPosition: {line: 1, character: 5},
            endPosition: {line: 1, character: 6},
            name: testFile,
            ruleName: "no-unconditional-jump"
        }
    ]
}];

process.stdin.on('data', function () {
 // needed for 'end' to be sent
});

process.stdin.on('end', function () {
    process.stdout.write(JSON.stringify(result));
});
