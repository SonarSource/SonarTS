//// [templateStringWithOpenCommentInStringPortion.ts]
` /**head  ${ 10 } // still middle  ${ 20 } /* still tail `

//// [templateStringWithOpenCommentInStringPortion.js]
" /**head  " + 10 + " // still middle  " + 20 + " /* still tail ";
