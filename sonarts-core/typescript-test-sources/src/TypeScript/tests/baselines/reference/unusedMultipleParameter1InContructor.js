//// [unusedMultipleParameter1InContructor.ts]
class Dummy {
    constructor(person: string, person2: string) {
        var unused = 20;
        person2 = "Dummy value";
    }
}

//// [unusedMultipleParameter1InContructor.js]
var Dummy = (function () {
    function Dummy(person, person2) {
        var unused = 20;
        person2 = "Dummy value";
    }
    return Dummy;
}());
