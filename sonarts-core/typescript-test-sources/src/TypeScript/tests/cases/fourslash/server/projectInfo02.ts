/// <reference path="../fourslash.ts"/>

// @Filename: a.ts
////export var test = "test String"

// @Filename: b.ts
////export var test2 = "test String"

// @Filename: tsconfig.json
////{ "files": ["a.ts", "b.ts"] }

goTo.file("a.ts")
verify.ProjectInfo(["lib.d.ts", "a.ts", "b.ts"])
