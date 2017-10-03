
var testFile = process.argv[2];
var result = [
    {
        failure: "some message",
        startPosition: {line: 1, character: 5},
        endPosition: {line: 1, character: 5},
        name: testFile,
        ruleName: "eofline"
    }
];

console.log(JSON.stringify(result));
