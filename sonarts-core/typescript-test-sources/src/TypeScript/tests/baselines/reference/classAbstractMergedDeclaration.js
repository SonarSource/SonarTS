//// [classAbstractMergedDeclaration.ts]
abstract class CM {}
module CM {}

module MC {}
abstract class MC {}

abstract class CI {}
interface CI {}

interface IC {}
abstract class IC {}

abstract class CC1 {}
class CC1 {}

class CC2 {}
abstract class CC2 {}

declare abstract class DCI {}
interface DCI {}

interface DIC {}
declare abstract class DIC {}

declare abstract class DCC1 {}
declare class DCC1 {}

declare class DCC2 {}
declare abstract class DCC2 {}

new CM;
new MC;
new CI;
new IC;
new CC1;
new CC2;
new DCI;
new DIC;
new DCC1;
new DCC2;

//// [classAbstractMergedDeclaration.js]
var CM = (function () {
    function CM() {
    }
    return CM;
}());
var MC = (function () {
    function MC() {
    }
    return MC;
}());
var CI = (function () {
    function CI() {
    }
    return CI;
}());
var IC = (function () {
    function IC() {
    }
    return IC;
}());
var CC1 = (function () {
    function CC1() {
    }
    return CC1;
}());
var CC1 = (function () {
    function CC1() {
    }
    return CC1;
}());
var CC2 = (function () {
    function CC2() {
    }
    return CC2;
}());
var CC2 = (function () {
    function CC2() {
    }
    return CC2;
}());
new CM;
new MC;
new CI;
new IC;
new CC1;
new CC2;
new DCI;
new DIC;
new DCC1;
new DCC2;
