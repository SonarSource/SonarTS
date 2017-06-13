// tslint:disable

let arr = [];
let arrConst = new Array();
let mySet = new Set();
let myMap = new Map();


if (mySet.size < 0) { }
//  ^^^^^^^^^^^^^^ {{The size of "mySet" is always ">=0", so fix this test to get the real expected behavior.}}
if (myMap.size < 0) { }
//  ^^^^^^^^^^^^^^ {{The size of "myMap" is always ">=0", so fix this test to get the real expected behavior.}}

if (arr.length < 0) { }
//  ^^^^^^^^^^^^^^ {{The length of "arr" is always ">=0", so fix this test to get the real expected behavior.}}

if (arr.length >= 0) { }
//  ^^^^^^^^^^^^^^^ {{The length of "arr" is always ">=0", so fix this test to get the real expected behavior.}}

// OK

if (arr.length < 1) { }
if (arr.length > 0) { }
if (arr.length <= 1) { }
if (arr.length >= 1) { }
if (arr.length < 50) { }
if (arr.length < 5 + 0) { }

const myObj = {length: -4, size: -5, foobar: 42};
if (myObj.foobar >= 0) {}
if (myObj.size >= 0) {}
if (myObj.length >= 0) {}
if (myObj.length < 0) {}
if (myObj.length < 53) {}
if (myObj.length > 0) {}
