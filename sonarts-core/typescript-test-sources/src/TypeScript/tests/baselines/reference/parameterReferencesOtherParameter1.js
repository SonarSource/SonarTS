//// [parameterReferencesOtherParameter1.ts]
class Model {
    public name: string;
}

class UI {
    constructor(model: Model, foo:string = model.name)
    {
    }
}

//// [parameterReferencesOtherParameter1.js]
var Model = (function () {
    function Model() {
    }
    return Model;
}());
var UI = (function () {
    function UI(model, foo) {
        if (foo === void 0) { foo = model.name; }
    }
    return UI;
}());
