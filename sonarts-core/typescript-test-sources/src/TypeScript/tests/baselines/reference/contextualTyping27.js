//// [contextualTyping27.ts]
function foo(param:{id:number;}){}; foo(<{id:number;}>({}));

//// [contextualTyping27.js]
function foo(param) { }
;
foo(({}));
