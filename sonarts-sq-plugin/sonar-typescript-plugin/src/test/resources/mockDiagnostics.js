#!/usr/bin/env node
var testFile = process.argv[2];

var result = [
  {
    filepath: testFile,
    diagnostics: [{"col": 0, "line": 1, "message": "Expression expected."}]
  }
];

process.stdin.on("data", function() {
  // needed for 'end' to be sent
});

process.stdin.on("end", function() {
  process.stdout.write(JSON.stringify(result));
});
