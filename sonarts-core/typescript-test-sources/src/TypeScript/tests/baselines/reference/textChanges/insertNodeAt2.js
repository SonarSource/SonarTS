===ORIGINAL===

// comment 1
var x = 1; // comment 2
// comment 3
var y; // comment 4
var z = 3; // comment 5
// comment 6
var a = 4; // comment 7
===MODIFIED===

// comment 1
var x = 1; // comment 2
// comment 3
var yz1 = {
    p1: 1
}; // comment 4
var z = 3; // comment 5
// comment 6
var a = 4; // comment 7