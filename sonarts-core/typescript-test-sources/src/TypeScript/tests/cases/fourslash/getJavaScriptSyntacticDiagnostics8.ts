/// <reference path="fourslash.ts" />

// @allowJs: true
// @Filename: a.js
//// type a = b;

verify.getSyntacticDiagnostics(`[
  {
    "message": "'type aliases' can only be used in a .ts file.",
    "start": 5,
    "length": 1,
    "category": "error",
    "code": 8008
  }
]`);