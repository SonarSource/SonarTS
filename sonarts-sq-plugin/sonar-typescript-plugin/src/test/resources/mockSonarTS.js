#!/usr/bin/env node
var testFile = process.argv[2];

var result = [
  {
    filepath: testFile,

    issues: [
      {
        failure: "some message",
        startPosition: { line: 1, character: 5 },
        endPosition: { line: 1, character: 6 },
        name: testFile,
        ruleName: "no-unconditional-jump",
        secondaryLocations: [
          { startLine: 1, startCol: 1, endLine: 1, endCol: 2, message: 'secondary location message' }
        ],
        cost: 42
      },
      {
        failure: "some message which should be replaced",
        startPosition: { line: 1, character: 5 },
        endPosition: { line: 1, character: 6 },
        name: testFile,
        ruleName: "no-eval",
        secondaryLocations: []
      }
    ],

    highlights: [
      { startLine: 2, startCol: 0, endLine: 2, endCol: 8, textType: "keyword" }
    ],

    cpdTokens: [
      { startLine: 2, startCol: 0, endLine: 2, endCol: 3, image: "foo" },
      { startLine: 2, startCol: 10, endLine: 2, endCol: 13, image: "bar" }
    ],

    symbols: [
      {
        startLine: 2, startCol: 0, endLine: 2, endCol: 3,
        references: [{ startLine: 2, startCol: 6, endLine: 2, endCol: 9 }]
      }
    ],

    ncloc: [55, 77, 99],
    commentLines: [24, 42],
    nosonarLines: [24],
    executableLines: [5, 7],
    statements: 100,
    functions: 10,
    classes: 1,
    complexity: 42,
    cognitiveComplexity: 22
  }
];

process.stdin.on("data", function() {
  // needed for 'end' to be sent
});

process.stdin.on("end", function() {
  process.stdout.write(JSON.stringify(result));
});
