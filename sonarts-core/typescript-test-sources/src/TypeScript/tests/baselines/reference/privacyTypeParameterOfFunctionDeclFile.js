//// [privacyTypeParameterOfFunctionDeclFile.ts]
class privateClass {
}

export class publicClass {
}

export interface publicInterfaceWithPrivateTypeParameters {
    new <T extends privateClass>(): privateClass;  // Error
    <T extends privateClass>(): privateClass;  // Error
    myMethod<T extends privateClass>(): privateClass;  // Error
}

export interface publicInterfaceWithPublicTypeParameters {
    new <T extends publicClass>(): publicClass;
    <T extends publicClass>(): publicClass;
    myMethod<T extends publicClass>(): publicClass;
}

interface privateInterfaceWithPrivateTypeParameters {
    new <T extends privateClass>(): privateClass;
    <T extends privateClass>(): privateClass;
    myMethod<T extends privateClass>(): privateClass;
}

interface privateInterfaceWithPublicTypeParameters {
    new <T extends publicClass>(): publicClass;
    <T extends publicClass>(): publicClass;
    myMethod<T extends publicClass>(): publicClass;
}

export class publicClassWithWithPrivateTypeParameters {
    static myPublicStaticMethod<T extends privateClass>() {  // Error
    }
    private static myPrivateStaticMethod<T extends privateClass>() {
    }
    myPublicMethod<T extends privateClass>() {  // Error
    }
    private myPrivateMethod<T extends privateClass>() {
    }
}

export class publicClassWithWithPublicTypeParameters {
    static myPublicStaticMethod<T extends publicClass>() {
    }
    private static myPrivateStaticMethod<T extends publicClass>() { 
    }
    myPublicMethod<T extends publicClass>() {
    }
    private myPrivateMethod<T extends publicClass>() {
    }
}

class privateClassWithWithPrivateTypeParameters {
    static myPublicStaticMethod<T extends privateClass>() {
    }
    private static myPrivateStaticMethod<T extends privateClass>() {
    }
    myPublicMethod<T extends privateClass>() {
    }
    private myPrivateMethod<T extends privateClass>() {
    }
}

class privateClassWithWithPublicTypeParameters {
    static myPublicStaticMethod<T extends publicClass>() {
    }
    private static myPrivateStaticMethod<T extends publicClass>() {
    }
    myPublicMethod<T extends publicClass>() {
    }
    private myPrivateMethod<T extends publicClass>() {
    }
}

export function publicFunctionWithPrivateTypeParameters<T extends privateClass>() {  // Error
}

export function publicFunctionWithPublicTypeParameters<T extends publicClass>() {
}

function privateFunctionWithPrivateTypeParameters<T extends privateClass>() {
}

function privateFunctionWithPublicTypeParameters<T extends publicClass>() {
}

export interface publicInterfaceWithPublicTypeParametersWithoutExtends {
    new <T>(): publicClass;
    <T>(): publicClass;
    myMethod<T>(): publicClass;
}

interface privateInterfaceWithPublicTypeParametersWithoutExtends {
    new <T>(): publicClass;
    <T>(): publicClass;
    myMethod<T>(): publicClass;
}

export class publicClassWithWithPublicTypeParametersWithoutExtends {
    static myPublicStaticMethod<T>() {
    }
    private static myPrivateStaticMethod<T>() {
    }
    myPublicMethod<T>() {
    }
    private myPrivateMethod<T>() {
    }
}
class privateClassWithWithPublicTypeParametersWithoutExtends {
    static myPublicStaticMethod<T>() {
    }
    private static myPrivateStaticMethod<T>() {
    }
    myPublicMethod<T>() {
    }
    private myPrivateMethod<T>() {
    }
}

export function publicFunctionWithPublicTypeParametersWithoutExtends<T>() {
}

function privateFunctionWithPublicTypeParametersWithoutExtends<T>() {
}

export interface publicInterfaceWithPrivatModuleTypeParameters {
    new <T extends privateModule.publicClass>(): privateModule.publicClass;  // Error
    <T extends privateModule.publicClass>(): privateModule.publicClass;  // Error
    myMethod<T extends privateModule.publicClass>(): privateModule.publicClass;  // Error
}
export class publicClassWithWithPrivateModuleTypeParameters {
    static myPublicStaticMethod<T extends privateModule.publicClass>() {  // Error
    }
    myPublicMethod<T extends privateModule.publicClass>() {  // Error
    }
}
export function publicFunctionWithPrivateMopduleTypeParameters<T extends privateModule.publicClass>() {  // Error
}


interface privateInterfaceWithPrivatModuleTypeParameters {
    new <T extends privateModule.publicClass>(): privateModule.publicClass;
    <T extends privateModule.publicClass>(): privateModule.publicClass;
    myMethod<T extends privateModule.publicClass>(): privateModule.publicClass;
}
class privateClassWithWithPrivateModuleTypeParameters {
    static myPublicStaticMethod<T extends privateModule.publicClass>() {
    }
    myPublicMethod<T extends privateModule.publicClass>() {
    }
}
function privateFunctionWithPrivateMopduleTypeParameters<T extends privateModule.publicClass>() {
}


export module publicModule {
    class privateClass {
    }

    export class publicClass {
    }

    export interface publicInterfaceWithPrivateTypeParameters {
        new <T extends privateClass>(): privateClass;  // Error
        <T extends privateClass>(): privateClass;  // Error
        myMethod<T extends privateClass>(): privateClass;  // Error
    }

    export interface publicInterfaceWithPublicTypeParameters {
        new <T extends publicClass>(): publicClass;
        <T extends publicClass>(): publicClass;
        myMethod<T extends publicClass>(): publicClass;
    }

    interface privateInterfaceWithPrivateTypeParameters {
        new <T extends privateClass>(): privateClass;
        <T extends privateClass>(): privateClass;
        myMethod<T extends privateClass>(): privateClass;
    }

    interface privateInterfaceWithPublicTypeParameters {
        new <T extends publicClass>(): publicClass;
        <T extends publicClass>(): publicClass;
        myMethod<T extends publicClass>(): publicClass;
    }

    export class publicClassWithWithPrivateTypeParameters {
        static myPublicStaticMethod<T extends privateClass>() {  // Error
        }
        private static myPrivateStaticMethod<T extends privateClass>() {
        }
        myPublicMethod<T extends privateClass>() {  // Error
        }
        private myPrivateMethod<T extends privateClass>() {
        }
    }

    export class publicClassWithWithPublicTypeParameters {
        static myPublicStaticMethod<T extends publicClass>() {
        }
        private static myPrivateStaticMethod<T extends publicClass>() {
        }
        myPublicMethod<T extends publicClass>() {
        }
        private myPrivateMethod<T extends publicClass>() {
        }
    }

    class privateClassWithWithPrivateTypeParameters {
        static myPublicStaticMethod<T extends privateClass>() {
        }
        private static myPrivateStaticMethod<T extends privateClass>() {
        }
        myPublicMethod<T extends privateClass>() {
        }
        private myPrivateMethod<T extends privateClass>() {
        }
    }

    class privateClassWithWithPublicTypeParameters {
        static myPublicStaticMethod<T extends publicClass>() {
        }
        private static myPrivateStaticMethod<T extends publicClass>() {
        }
        myPublicMethod<T extends publicClass>() {
        }
        private myPrivateMethod<T extends publicClass>() {
        }
    }

    export function publicFunctionWithPrivateTypeParameters<T extends privateClass>() {  // Error
    }

    export function publicFunctionWithPublicTypeParameters<T extends publicClass>() {
    }

    function privateFunctionWithPrivateTypeParameters<T extends privateClass>() {
    }

    function privateFunctionWithPublicTypeParameters<T extends publicClass>() {
    }

    export interface publicInterfaceWithPublicTypeParametersWithoutExtends {
        new <T>(): publicClass;
        <T>(): publicClass;
        myMethod<T>(): publicClass;
    }

    interface privateInterfaceWithPublicTypeParametersWithoutExtends {
        new <T>(): publicClass;
        <T>(): publicClass;
        myMethod<T>(): publicClass;
    }

    export class publicClassWithWithPublicTypeParametersWithoutExtends {
        static myPublicStaticMethod<T>() {
        }
        private static myPrivateStaticMethod<T>() {
        }
        myPublicMethod<T>() {
        }
        private myPrivateMethod<T>() {
        }
    }
    class privateClassWithWithPublicTypeParametersWithoutExtends {
        static myPublicStaticMethod<T>() {
        }
        private static myPrivateStaticMethod<T>() {
        }
        myPublicMethod<T>() {
        }
        private myPrivateMethod<T>() {
        }
    }

    export function publicFunctionWithPublicTypeParametersWithoutExtends<T>() {
    }

    function privateFunctionWithPublicTypeParametersWithoutExtends<T>() {
    }

    export interface publicInterfaceWithPrivatModuleTypeParameters {
        new <T extends privateModule.publicClass>(): privateModule.publicClass;  // Error
        <T extends privateModule.publicClass>(): privateModule.publicClass;  // Error
        myMethod<T extends privateModule.publicClass>(): privateModule.publicClass;  // Error
    }
    export class publicClassWithWithPrivateModuleTypeParameters {
        static myPublicStaticMethod<T extends privateModule.publicClass>() {  // Error
        }
        myPublicMethod<T extends privateModule.publicClass>() {  // Error
        }
    }
    export function publicFunctionWithPrivateMopduleTypeParameters<T extends privateModule.publicClass>() {  // Error
    }


    interface privateInterfaceWithPrivatModuleTypeParameters {
        new <T extends privateModule.publicClass>(): privateModule.publicClass;  
        <T extends privateModule.publicClass>(): privateModule.publicClass;  
        myMethod<T extends privateModule.publicClass>(): privateModule.publicClass;  
    }
    class privateClassWithWithPrivateModuleTypeParameters {
        static myPublicStaticMethod<T extends privateModule.publicClass>() {  
        }
        myPublicMethod<T extends privateModule.publicClass>() { 
        }
    }
    function privateFunctionWithPrivateMopduleTypeParameters<T extends privateModule.publicClass>() { 
    }

}

module privateModule {
    class privateClass {
    }

    export class publicClass {
    }

    export interface publicInterfaceWithPrivateTypeParameters {
        new <T extends privateClass>(): privateClass; 
        <T extends privateClass>(): privateClass;
        myMethod<T extends privateClass>(): privateClass; 
    }

    export interface publicInterfaceWithPublicTypeParameters {
        new <T extends publicClass>(): publicClass;
        <T extends publicClass>(): publicClass;
        myMethod<T extends publicClass>(): publicClass;
    }

    interface privateInterfaceWithPrivateTypeParameters {
        new <T extends privateClass>(): privateClass;
        <T extends privateClass>(): privateClass;
        myMethod<T extends privateClass>(): privateClass;
    }

    interface privateInterfaceWithPublicTypeParameters {
        new <T extends publicClass>(): publicClass;
        <T extends publicClass>(): publicClass;
        myMethod<T extends publicClass>(): publicClass;
    }

    export class publicClassWithWithPrivateTypeParameters {
        static myPublicStaticMethod<T extends privateClass>() { 
        }
        private static myPrivateStaticMethod<T extends privateClass>() {
        }
        myPublicMethod<T extends privateClass>() {  
        }
        private myPrivateMethod<T extends privateClass>() {
        }
    }

    export class publicClassWithWithPublicTypeParameters {
        static myPublicStaticMethod<T extends publicClass>() {
        }
        private static myPrivateStaticMethod<T extends publicClass>() {
        }
        myPublicMethod<T extends publicClass>() {
        }
        private myPrivateMethod<T extends publicClass>() {
        }
    }

    class privateClassWithWithPrivateTypeParameters {
        static myPublicStaticMethod<T extends privateClass>() {
        }
        private static myPrivateStaticMethod<T extends privateClass>() {
        }
        myPublicMethod<T extends privateClass>() {
        }
        private myPrivateMethod<T extends privateClass>() {
        }
    }

    class privateClassWithWithPublicTypeParameters {
        static myPublicStaticMethod<T extends publicClass>() {
        }
        private static myPrivateStaticMethod<T extends publicClass>() {
        }
        myPublicMethod<T extends publicClass>() {
        }
        private myPrivateMethod<T extends publicClass>() {
        }
    }

    export function publicFunctionWithPrivateTypeParameters<T extends privateClass>() { 
    }

    export function publicFunctionWithPublicTypeParameters<T extends publicClass>() {
    }

    function privateFunctionWithPrivateTypeParameters<T extends privateClass>() {
    }

    function privateFunctionWithPublicTypeParameters<T extends publicClass>() {
    }

    export interface publicInterfaceWithPublicTypeParametersWithoutExtends {
        new <T>(): publicClass;
        <T>(): publicClass;
        myMethod<T>(): publicClass;
    }

    interface privateInterfaceWithPublicTypeParametersWithoutExtends {
        new <T>(): publicClass;
        <T>(): publicClass;
        myMethod<T>(): publicClass;
    }

    export class publicClassWithWithPublicTypeParametersWithoutExtends {
        static myPublicStaticMethod<T>() {
        }
        private static myPrivateStaticMethod<T>() {
        }
        myPublicMethod<T>() {
        }
        private myPrivateMethod<T>() {
        }
    }
    class privateClassWithWithPublicTypeParametersWithoutExtends {
        static myPublicStaticMethod<T>() {
        }
        private static myPrivateStaticMethod<T>() {
        }
        myPublicMethod<T>() {
        }
        private myPrivateMethod<T>() {
        }
    }

    export function publicFunctionWithPublicTypeParametersWithoutExtends<T>() {
    }

    function privateFunctionWithPublicTypeParametersWithoutExtends<T>() {
    }
}

//// [privacyTypeParameterOfFunctionDeclFile.js]
"use strict";
exports.__esModule = true;
var privateClass = (function () {
    function privateClass() {
    }
    return privateClass;
}());
var publicClass = (function () {
    function publicClass() {
    }
    return publicClass;
}());
exports.publicClass = publicClass;
var publicClassWithWithPrivateTypeParameters = (function () {
    function publicClassWithWithPrivateTypeParameters() {
    }
    publicClassWithWithPrivateTypeParameters.myPublicStaticMethod = function () {
    };
    publicClassWithWithPrivateTypeParameters.myPrivateStaticMethod = function () {
    };
    publicClassWithWithPrivateTypeParameters.prototype.myPublicMethod = function () {
    };
    publicClassWithWithPrivateTypeParameters.prototype.myPrivateMethod = function () {
    };
    return publicClassWithWithPrivateTypeParameters;
}());
exports.publicClassWithWithPrivateTypeParameters = publicClassWithWithPrivateTypeParameters;
var publicClassWithWithPublicTypeParameters = (function () {
    function publicClassWithWithPublicTypeParameters() {
    }
    publicClassWithWithPublicTypeParameters.myPublicStaticMethod = function () {
    };
    publicClassWithWithPublicTypeParameters.myPrivateStaticMethod = function () {
    };
    publicClassWithWithPublicTypeParameters.prototype.myPublicMethod = function () {
    };
    publicClassWithWithPublicTypeParameters.prototype.myPrivateMethod = function () {
    };
    return publicClassWithWithPublicTypeParameters;
}());
exports.publicClassWithWithPublicTypeParameters = publicClassWithWithPublicTypeParameters;
var privateClassWithWithPrivateTypeParameters = (function () {
    function privateClassWithWithPrivateTypeParameters() {
    }
    privateClassWithWithPrivateTypeParameters.myPublicStaticMethod = function () {
    };
    privateClassWithWithPrivateTypeParameters.myPrivateStaticMethod = function () {
    };
    privateClassWithWithPrivateTypeParameters.prototype.myPublicMethod = function () {
    };
    privateClassWithWithPrivateTypeParameters.prototype.myPrivateMethod = function () {
    };
    return privateClassWithWithPrivateTypeParameters;
}());
var privateClassWithWithPublicTypeParameters = (function () {
    function privateClassWithWithPublicTypeParameters() {
    }
    privateClassWithWithPublicTypeParameters.myPublicStaticMethod = function () {
    };
    privateClassWithWithPublicTypeParameters.myPrivateStaticMethod = function () {
    };
    privateClassWithWithPublicTypeParameters.prototype.myPublicMethod = function () {
    };
    privateClassWithWithPublicTypeParameters.prototype.myPrivateMethod = function () {
    };
    return privateClassWithWithPublicTypeParameters;
}());
function publicFunctionWithPrivateTypeParameters() {
}
exports.publicFunctionWithPrivateTypeParameters = publicFunctionWithPrivateTypeParameters;
function publicFunctionWithPublicTypeParameters() {
}
exports.publicFunctionWithPublicTypeParameters = publicFunctionWithPublicTypeParameters;
function privateFunctionWithPrivateTypeParameters() {
}
function privateFunctionWithPublicTypeParameters() {
}
var publicClassWithWithPublicTypeParametersWithoutExtends = (function () {
    function publicClassWithWithPublicTypeParametersWithoutExtends() {
    }
    publicClassWithWithPublicTypeParametersWithoutExtends.myPublicStaticMethod = function () {
    };
    publicClassWithWithPublicTypeParametersWithoutExtends.myPrivateStaticMethod = function () {
    };
    publicClassWithWithPublicTypeParametersWithoutExtends.prototype.myPublicMethod = function () {
    };
    publicClassWithWithPublicTypeParametersWithoutExtends.prototype.myPrivateMethod = function () {
    };
    return publicClassWithWithPublicTypeParametersWithoutExtends;
}());
exports.publicClassWithWithPublicTypeParametersWithoutExtends = publicClassWithWithPublicTypeParametersWithoutExtends;
var privateClassWithWithPublicTypeParametersWithoutExtends = (function () {
    function privateClassWithWithPublicTypeParametersWithoutExtends() {
    }
    privateClassWithWithPublicTypeParametersWithoutExtends.myPublicStaticMethod = function () {
    };
    privateClassWithWithPublicTypeParametersWithoutExtends.myPrivateStaticMethod = function () {
    };
    privateClassWithWithPublicTypeParametersWithoutExtends.prototype.myPublicMethod = function () {
    };
    privateClassWithWithPublicTypeParametersWithoutExtends.prototype.myPrivateMethod = function () {
    };
    return privateClassWithWithPublicTypeParametersWithoutExtends;
}());
function publicFunctionWithPublicTypeParametersWithoutExtends() {
}
exports.publicFunctionWithPublicTypeParametersWithoutExtends = publicFunctionWithPublicTypeParametersWithoutExtends;
function privateFunctionWithPublicTypeParametersWithoutExtends() {
}
var publicClassWithWithPrivateModuleTypeParameters = (function () {
    function publicClassWithWithPrivateModuleTypeParameters() {
    }
    publicClassWithWithPrivateModuleTypeParameters.myPublicStaticMethod = function () {
    };
    publicClassWithWithPrivateModuleTypeParameters.prototype.myPublicMethod = function () {
    };
    return publicClassWithWithPrivateModuleTypeParameters;
}());
exports.publicClassWithWithPrivateModuleTypeParameters = publicClassWithWithPrivateModuleTypeParameters;
function publicFunctionWithPrivateMopduleTypeParameters() {
}
exports.publicFunctionWithPrivateMopduleTypeParameters = publicFunctionWithPrivateMopduleTypeParameters;
var privateClassWithWithPrivateModuleTypeParameters = (function () {
    function privateClassWithWithPrivateModuleTypeParameters() {
    }
    privateClassWithWithPrivateModuleTypeParameters.myPublicStaticMethod = function () {
    };
    privateClassWithWithPrivateModuleTypeParameters.prototype.myPublicMethod = function () {
    };
    return privateClassWithWithPrivateModuleTypeParameters;
}());
function privateFunctionWithPrivateMopduleTypeParameters() {
}
var publicModule;
(function (publicModule) {
    var privateClass = (function () {
        function privateClass() {
        }
        return privateClass;
    }());
    var publicClass = (function () {
        function publicClass() {
        }
        return publicClass;
    }());
    publicModule.publicClass = publicClass;
    var publicClassWithWithPrivateTypeParameters = (function () {
        function publicClassWithWithPrivateTypeParameters() {
        }
        publicClassWithWithPrivateTypeParameters.myPublicStaticMethod = function () {
        };
        publicClassWithWithPrivateTypeParameters.myPrivateStaticMethod = function () {
        };
        publicClassWithWithPrivateTypeParameters.prototype.myPublicMethod = function () {
        };
        publicClassWithWithPrivateTypeParameters.prototype.myPrivateMethod = function () {
        };
        return publicClassWithWithPrivateTypeParameters;
    }());
    publicModule.publicClassWithWithPrivateTypeParameters = publicClassWithWithPrivateTypeParameters;
    var publicClassWithWithPublicTypeParameters = (function () {
        function publicClassWithWithPublicTypeParameters() {
        }
        publicClassWithWithPublicTypeParameters.myPublicStaticMethod = function () {
        };
        publicClassWithWithPublicTypeParameters.myPrivateStaticMethod = function () {
        };
        publicClassWithWithPublicTypeParameters.prototype.myPublicMethod = function () {
        };
        publicClassWithWithPublicTypeParameters.prototype.myPrivateMethod = function () {
        };
        return publicClassWithWithPublicTypeParameters;
    }());
    publicModule.publicClassWithWithPublicTypeParameters = publicClassWithWithPublicTypeParameters;
    var privateClassWithWithPrivateTypeParameters = (function () {
        function privateClassWithWithPrivateTypeParameters() {
        }
        privateClassWithWithPrivateTypeParameters.myPublicStaticMethod = function () {
        };
        privateClassWithWithPrivateTypeParameters.myPrivateStaticMethod = function () {
        };
        privateClassWithWithPrivateTypeParameters.prototype.myPublicMethod = function () {
        };
        privateClassWithWithPrivateTypeParameters.prototype.myPrivateMethod = function () {
        };
        return privateClassWithWithPrivateTypeParameters;
    }());
    var privateClassWithWithPublicTypeParameters = (function () {
        function privateClassWithWithPublicTypeParameters() {
        }
        privateClassWithWithPublicTypeParameters.myPublicStaticMethod = function () {
        };
        privateClassWithWithPublicTypeParameters.myPrivateStaticMethod = function () {
        };
        privateClassWithWithPublicTypeParameters.prototype.myPublicMethod = function () {
        };
        privateClassWithWithPublicTypeParameters.prototype.myPrivateMethod = function () {
        };
        return privateClassWithWithPublicTypeParameters;
    }());
    function publicFunctionWithPrivateTypeParameters() {
    }
    publicModule.publicFunctionWithPrivateTypeParameters = publicFunctionWithPrivateTypeParameters;
    function publicFunctionWithPublicTypeParameters() {
    }
    publicModule.publicFunctionWithPublicTypeParameters = publicFunctionWithPublicTypeParameters;
    function privateFunctionWithPrivateTypeParameters() {
    }
    function privateFunctionWithPublicTypeParameters() {
    }
    var publicClassWithWithPublicTypeParametersWithoutExtends = (function () {
        function publicClassWithWithPublicTypeParametersWithoutExtends() {
        }
        publicClassWithWithPublicTypeParametersWithoutExtends.myPublicStaticMethod = function () {
        };
        publicClassWithWithPublicTypeParametersWithoutExtends.myPrivateStaticMethod = function () {
        };
        publicClassWithWithPublicTypeParametersWithoutExtends.prototype.myPublicMethod = function () {
        };
        publicClassWithWithPublicTypeParametersWithoutExtends.prototype.myPrivateMethod = function () {
        };
        return publicClassWithWithPublicTypeParametersWithoutExtends;
    }());
    publicModule.publicClassWithWithPublicTypeParametersWithoutExtends = publicClassWithWithPublicTypeParametersWithoutExtends;
    var privateClassWithWithPublicTypeParametersWithoutExtends = (function () {
        function privateClassWithWithPublicTypeParametersWithoutExtends() {
        }
        privateClassWithWithPublicTypeParametersWithoutExtends.myPublicStaticMethod = function () {
        };
        privateClassWithWithPublicTypeParametersWithoutExtends.myPrivateStaticMethod = function () {
        };
        privateClassWithWithPublicTypeParametersWithoutExtends.prototype.myPublicMethod = function () {
        };
        privateClassWithWithPublicTypeParametersWithoutExtends.prototype.myPrivateMethod = function () {
        };
        return privateClassWithWithPublicTypeParametersWithoutExtends;
    }());
    function publicFunctionWithPublicTypeParametersWithoutExtends() {
    }
    publicModule.publicFunctionWithPublicTypeParametersWithoutExtends = publicFunctionWithPublicTypeParametersWithoutExtends;
    function privateFunctionWithPublicTypeParametersWithoutExtends() {
    }
    var publicClassWithWithPrivateModuleTypeParameters = (function () {
        function publicClassWithWithPrivateModuleTypeParameters() {
        }
        publicClassWithWithPrivateModuleTypeParameters.myPublicStaticMethod = function () {
        };
        publicClassWithWithPrivateModuleTypeParameters.prototype.myPublicMethod = function () {
        };
        return publicClassWithWithPrivateModuleTypeParameters;
    }());
    publicModule.publicClassWithWithPrivateModuleTypeParameters = publicClassWithWithPrivateModuleTypeParameters;
    function publicFunctionWithPrivateMopduleTypeParameters() {
    }
    publicModule.publicFunctionWithPrivateMopduleTypeParameters = publicFunctionWithPrivateMopduleTypeParameters;
    var privateClassWithWithPrivateModuleTypeParameters = (function () {
        function privateClassWithWithPrivateModuleTypeParameters() {
        }
        privateClassWithWithPrivateModuleTypeParameters.myPublicStaticMethod = function () {
        };
        privateClassWithWithPrivateModuleTypeParameters.prototype.myPublicMethod = function () {
        };
        return privateClassWithWithPrivateModuleTypeParameters;
    }());
    function privateFunctionWithPrivateMopduleTypeParameters() {
    }
})(publicModule = exports.publicModule || (exports.publicModule = {}));
var privateModule;
(function (privateModule) {
    var privateClass = (function () {
        function privateClass() {
        }
        return privateClass;
    }());
    var publicClass = (function () {
        function publicClass() {
        }
        return publicClass;
    }());
    privateModule.publicClass = publicClass;
    var publicClassWithWithPrivateTypeParameters = (function () {
        function publicClassWithWithPrivateTypeParameters() {
        }
        publicClassWithWithPrivateTypeParameters.myPublicStaticMethod = function () {
        };
        publicClassWithWithPrivateTypeParameters.myPrivateStaticMethod = function () {
        };
        publicClassWithWithPrivateTypeParameters.prototype.myPublicMethod = function () {
        };
        publicClassWithWithPrivateTypeParameters.prototype.myPrivateMethod = function () {
        };
        return publicClassWithWithPrivateTypeParameters;
    }());
    privateModule.publicClassWithWithPrivateTypeParameters = publicClassWithWithPrivateTypeParameters;
    var publicClassWithWithPublicTypeParameters = (function () {
        function publicClassWithWithPublicTypeParameters() {
        }
        publicClassWithWithPublicTypeParameters.myPublicStaticMethod = function () {
        };
        publicClassWithWithPublicTypeParameters.myPrivateStaticMethod = function () {
        };
        publicClassWithWithPublicTypeParameters.prototype.myPublicMethod = function () {
        };
        publicClassWithWithPublicTypeParameters.prototype.myPrivateMethod = function () {
        };
        return publicClassWithWithPublicTypeParameters;
    }());
    privateModule.publicClassWithWithPublicTypeParameters = publicClassWithWithPublicTypeParameters;
    var privateClassWithWithPrivateTypeParameters = (function () {
        function privateClassWithWithPrivateTypeParameters() {
        }
        privateClassWithWithPrivateTypeParameters.myPublicStaticMethod = function () {
        };
        privateClassWithWithPrivateTypeParameters.myPrivateStaticMethod = function () {
        };
        privateClassWithWithPrivateTypeParameters.prototype.myPublicMethod = function () {
        };
        privateClassWithWithPrivateTypeParameters.prototype.myPrivateMethod = function () {
        };
        return privateClassWithWithPrivateTypeParameters;
    }());
    var privateClassWithWithPublicTypeParameters = (function () {
        function privateClassWithWithPublicTypeParameters() {
        }
        privateClassWithWithPublicTypeParameters.myPublicStaticMethod = function () {
        };
        privateClassWithWithPublicTypeParameters.myPrivateStaticMethod = function () {
        };
        privateClassWithWithPublicTypeParameters.prototype.myPublicMethod = function () {
        };
        privateClassWithWithPublicTypeParameters.prototype.myPrivateMethod = function () {
        };
        return privateClassWithWithPublicTypeParameters;
    }());
    function publicFunctionWithPrivateTypeParameters() {
    }
    privateModule.publicFunctionWithPrivateTypeParameters = publicFunctionWithPrivateTypeParameters;
    function publicFunctionWithPublicTypeParameters() {
    }
    privateModule.publicFunctionWithPublicTypeParameters = publicFunctionWithPublicTypeParameters;
    function privateFunctionWithPrivateTypeParameters() {
    }
    function privateFunctionWithPublicTypeParameters() {
    }
    var publicClassWithWithPublicTypeParametersWithoutExtends = (function () {
        function publicClassWithWithPublicTypeParametersWithoutExtends() {
        }
        publicClassWithWithPublicTypeParametersWithoutExtends.myPublicStaticMethod = function () {
        };
        publicClassWithWithPublicTypeParametersWithoutExtends.myPrivateStaticMethod = function () {
        };
        publicClassWithWithPublicTypeParametersWithoutExtends.prototype.myPublicMethod = function () {
        };
        publicClassWithWithPublicTypeParametersWithoutExtends.prototype.myPrivateMethod = function () {
        };
        return publicClassWithWithPublicTypeParametersWithoutExtends;
    }());
    privateModule.publicClassWithWithPublicTypeParametersWithoutExtends = publicClassWithWithPublicTypeParametersWithoutExtends;
    var privateClassWithWithPublicTypeParametersWithoutExtends = (function () {
        function privateClassWithWithPublicTypeParametersWithoutExtends() {
        }
        privateClassWithWithPublicTypeParametersWithoutExtends.myPublicStaticMethod = function () {
        };
        privateClassWithWithPublicTypeParametersWithoutExtends.myPrivateStaticMethod = function () {
        };
        privateClassWithWithPublicTypeParametersWithoutExtends.prototype.myPublicMethod = function () {
        };
        privateClassWithWithPublicTypeParametersWithoutExtends.prototype.myPrivateMethod = function () {
        };
        return privateClassWithWithPublicTypeParametersWithoutExtends;
    }());
    function publicFunctionWithPublicTypeParametersWithoutExtends() {
    }
    privateModule.publicFunctionWithPublicTypeParametersWithoutExtends = publicFunctionWithPublicTypeParametersWithoutExtends;
    function privateFunctionWithPublicTypeParametersWithoutExtends() {
    }
})(privateModule || (privateModule = {}));
