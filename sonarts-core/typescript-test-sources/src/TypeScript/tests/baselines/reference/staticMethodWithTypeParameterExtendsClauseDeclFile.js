//// [staticMethodWithTypeParameterExtendsClauseDeclFile.ts]
class privateClass {
}

export class publicClass {
}

export class publicClassWithWithPrivateTypeParameters {
    private static myPrivateStaticMethod1<T extends privateClass>() { // do not emit extends clause
    }
    private myPrivateMethod1<T extends privateClass>() { // do not emit extends clause
    }
    private static myPrivateStaticMethod2<T extends publicClass>() { // do not emit extends clause
    }
    private myPrivateMethod2<T extends publicClass>() { // do not emit extends clause
    }
    public static myPublicStaticMethod<T extends publicClass>() {
    }
    public myPublicMethod<T extends publicClass>() {
    }
}


//// [staticMethodWithTypeParameterExtendsClauseDeclFile.js]
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
    publicClassWithWithPrivateTypeParameters.myPrivateStaticMethod1 = function () {
    };
    publicClassWithWithPrivateTypeParameters.prototype.myPrivateMethod1 = function () {
    };
    publicClassWithWithPrivateTypeParameters.myPrivateStaticMethod2 = function () {
    };
    publicClassWithWithPrivateTypeParameters.prototype.myPrivateMethod2 = function () {
    };
    publicClassWithWithPrivateTypeParameters.myPublicStaticMethod = function () {
    };
    publicClassWithWithPrivateTypeParameters.prototype.myPublicMethod = function () {
    };
    return publicClassWithWithPrivateTypeParameters;
}());
exports.publicClassWithWithPrivateTypeParameters = publicClassWithWithPrivateTypeParameters;


//// [staticMethodWithTypeParameterExtendsClauseDeclFile.d.ts]
export declare class publicClass {
}
export declare class publicClassWithWithPrivateTypeParameters {
    private static myPrivateStaticMethod1<T>();
    private myPrivateMethod1<T>();
    private static myPrivateStaticMethod2<T>();
    private myPrivateMethod2<T>();
    static myPublicStaticMethod<T extends publicClass>(): void;
    myPublicMethod<T extends publicClass>(): void;
}
