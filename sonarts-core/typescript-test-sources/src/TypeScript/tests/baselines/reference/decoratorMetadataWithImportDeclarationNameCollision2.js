//// [tests/cases/compiler/decoratorMetadataWithImportDeclarationNameCollision2.ts] ////

//// [db.ts]
export class db {
    public doSomething() {
    }
}

//// [service.ts]
import {db as Database} from './db';
function someDecorator(target) {
    return target;
}
@someDecorator
class MyClass {
    db: Database;

    constructor(db: Database) { // no collision
        this.db = db;
        this.db.doSomething();
    }
}
export {MyClass};


//// [db.js]
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var db = (function () {
    function db() {
    }
    db.prototype.doSomething = function () {
    };
    return db;
}());
exports.db = db;
//// [service.js]
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var db_1 = require("./db");
function someDecorator(target) {
    return target;
}
var MyClass = (function () {
    function MyClass(db) {
        this.db = db;
        this.db.doSomething();
    }
    return MyClass;
}());
MyClass = __decorate([
    someDecorator,
    __metadata("design:paramtypes", [db_1.db])
], MyClass);
exports.MyClass = MyClass;
