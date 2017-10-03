//// [mappedTypeRelationships.ts]
function f1<T>(x: T, k: keyof T) {
    return x[k];
}

function f2<T, K extends keyof T>(x: T, k: K) {
    return x[k];
}

function f3<T, U extends T>(x: T, y: U, k: keyof T) {
    x[k] = y[k];
    y[k] = x[k];  // Error
}

function f4<T, U extends T, K extends keyof T>(x: T, y: U, k: K) {
    x[k] = y[k];
    y[k] = x[k];  // Error
}

function f5<T, U extends T>(x: T, y: U, k: keyof U) {
    x[k] = y[k];  // Error
    y[k] = x[k];  // Error
}

function f6<T, U extends T, K extends keyof U>(x: T, y: U, k: K) {
    x[k] = y[k];  // Error
    y[k] = x[k];  // Error
}

function f10<T>(x: T, y: Partial<T>, k: keyof T) {
    x[k] = y[k];  // Error
    y[k] = x[k];
}

function f11<T, K extends keyof T>(x: T, y: Partial<T>, k: K) {
    x[k] = y[k];  // Error
    y[k] = x[k];
}

function f12<T, U extends T>(x: T, y: Partial<U>, k: keyof T) {
    x[k] = y[k];  // Error
    y[k] = x[k];  // Error
}

function f13<T, U extends T, K extends keyof T>(x: T, y: Partial<U>, k: K) {
    x[k] = y[k];  // Error
    y[k] = x[k];  // Error
}

function f20<T>(x: T, y: Readonly<T>, k: keyof T) {
    x[k] = y[k];
    y[k] = x[k];  // Error
}

function f21<T, K extends keyof T>(x: T, y: Readonly<T>, k: K) {
    x[k] = y[k];
    y[k] = x[k];  // Error
}

function f22<T, U extends T>(x: T, y: Readonly<U>, k: keyof T) {
    x[k] = y[k];
    y[k] = x[k];  // Error
}

function f23<T, U extends T, K extends keyof T>(x: T, y: Readonly<U>, k: K) {
    x[k] = y[k];
    y[k] = x[k];  // Error
}

function f30<T>(x: T, y: Partial<T>) {
    x = y;  // Error
    y = x;
}

function f31<T>(x: T, y: Partial<T>) {
    x = y;  // Error
    y = x;
}

function f40<T>(x: T, y: Readonly<T>) {
    x = y;
    y = x;
}

function f41<T>(x: T, y: Readonly<T>) {
    x = y;
    y = x;
}

type Item = {
    name: string;
}

type ItemMap = {
    [x: string]: Item;
}

function f50<T extends ItemMap>(obj: T, key: keyof T) {
    let item: Item = obj[key];
    return obj[key].name;
}

function f51<T extends ItemMap, K extends keyof T>(obj: T, key: K) {
    let item: Item = obj[key];
    return obj[key].name;
}

type T1<T> = {
    [P in keyof T]: T[P];
}

type T2<T> = {
    [P in keyof T]: T[P];
}

function f60<U>(x: T1<U>, y: T2<U>) {
    x = y;
    y = x;
}

type Identity<T> = {
    [P in keyof T]: T[P];
}

function f61<U>(x: Identity<U>, y: Partial<U>) {
    x = y;  // Error
    y = x;
}

function f62<U>(x: Identity<U>, y: Readonly<U>) {
    x = y;
    y = x;
}

function f70<T>(x: { [P in keyof T]: T[P] }, y: { [P in keyof T]: T[P] }) {
    x = y;
    y = x;
}

function f71<T, U extends T>(x: { [P in keyof T]: T[P] }, y: { [P in keyof T]: U[P] }) {
    x = y;
    y = x;  // Error
}

function f72<T, U extends T>(x: { [P in keyof T]: T[P] }, y: { [P in keyof U]: U[P] }) {
    x = y;
    y = x;  // Error
}

function f73<T, K extends keyof T>(x: { [P in K]: T[P] }, y: { [P in keyof T]: T[P] }) {
    x = y;
    y = x;  // Error
}

function f74<T, U extends T, K extends keyof T>(x: { [P in K]: T[P] }, y: { [P in keyof U]: U[P] }) {
    x = y;
    y = x;  // Error
}

function f75<T, U extends T, K extends keyof T>(x: { [P in K]: T[P] }, y: { [P in keyof T]: U[P] }) {
    x = y;
    y = x;  // Error
}

function f76<T, U extends T, K extends keyof T>(x: { [P in K]: T[P] }, y: { [P in K]: U[P] }) {
    x = y;
    y = x;  // Error
}


//// [mappedTypeRelationships.js]
function f1(x, k) {
    return x[k];
}
function f2(x, k) {
    return x[k];
}
function f3(x, y, k) {
    x[k] = y[k];
    y[k] = x[k]; // Error
}
function f4(x, y, k) {
    x[k] = y[k];
    y[k] = x[k]; // Error
}
function f5(x, y, k) {
    x[k] = y[k]; // Error
    y[k] = x[k]; // Error
}
function f6(x, y, k) {
    x[k] = y[k]; // Error
    y[k] = x[k]; // Error
}
function f10(x, y, k) {
    x[k] = y[k]; // Error
    y[k] = x[k];
}
function f11(x, y, k) {
    x[k] = y[k]; // Error
    y[k] = x[k];
}
function f12(x, y, k) {
    x[k] = y[k]; // Error
    y[k] = x[k]; // Error
}
function f13(x, y, k) {
    x[k] = y[k]; // Error
    y[k] = x[k]; // Error
}
function f20(x, y, k) {
    x[k] = y[k];
    y[k] = x[k]; // Error
}
function f21(x, y, k) {
    x[k] = y[k];
    y[k] = x[k]; // Error
}
function f22(x, y, k) {
    x[k] = y[k];
    y[k] = x[k]; // Error
}
function f23(x, y, k) {
    x[k] = y[k];
    y[k] = x[k]; // Error
}
function f30(x, y) {
    x = y; // Error
    y = x;
}
function f31(x, y) {
    x = y; // Error
    y = x;
}
function f40(x, y) {
    x = y;
    y = x;
}
function f41(x, y) {
    x = y;
    y = x;
}
function f50(obj, key) {
    var item = obj[key];
    return obj[key].name;
}
function f51(obj, key) {
    var item = obj[key];
    return obj[key].name;
}
function f60(x, y) {
    x = y;
    y = x;
}
function f61(x, y) {
    x = y; // Error
    y = x;
}
function f62(x, y) {
    x = y;
    y = x;
}
function f70(x, y) {
    x = y;
    y = x;
}
function f71(x, y) {
    x = y;
    y = x; // Error
}
function f72(x, y) {
    x = y;
    y = x; // Error
}
function f73(x, y) {
    x = y;
    y = x; // Error
}
function f74(x, y) {
    x = y;
    y = x; // Error
}
function f75(x, y) {
    x = y;
    y = x; // Error
}
function f76(x, y) {
    x = y;
    y = x; // Error
}


//// [mappedTypeRelationships.d.ts]
declare function f1<T>(x: T, k: keyof T): T[keyof T];
declare function f2<T, K extends keyof T>(x: T, k: K): T[K];
declare function f3<T, U extends T>(x: T, y: U, k: keyof T): void;
declare function f4<T, U extends T, K extends keyof T>(x: T, y: U, k: K): void;
declare function f5<T, U extends T>(x: T, y: U, k: keyof U): void;
declare function f6<T, U extends T, K extends keyof U>(x: T, y: U, k: K): void;
declare function f10<T>(x: T, y: Partial<T>, k: keyof T): void;
declare function f11<T, K extends keyof T>(x: T, y: Partial<T>, k: K): void;
declare function f12<T, U extends T>(x: T, y: Partial<U>, k: keyof T): void;
declare function f13<T, U extends T, K extends keyof T>(x: T, y: Partial<U>, k: K): void;
declare function f20<T>(x: T, y: Readonly<T>, k: keyof T): void;
declare function f21<T, K extends keyof T>(x: T, y: Readonly<T>, k: K): void;
declare function f22<T, U extends T>(x: T, y: Readonly<U>, k: keyof T): void;
declare function f23<T, U extends T, K extends keyof T>(x: T, y: Readonly<U>, k: K): void;
declare function f30<T>(x: T, y: Partial<T>): void;
declare function f31<T>(x: T, y: Partial<T>): void;
declare function f40<T>(x: T, y: Readonly<T>): void;
declare function f41<T>(x: T, y: Readonly<T>): void;
declare type Item = {
    name: string;
};
declare type ItemMap = {
    [x: string]: Item;
};
declare function f50<T extends ItemMap>(obj: T, key: keyof T): string;
declare function f51<T extends ItemMap, K extends keyof T>(obj: T, key: K): string;
declare type T1<T> = {
    [P in keyof T]: T[P];
};
declare type T2<T> = {
    [P in keyof T]: T[P];
};
declare function f60<U>(x: T1<U>, y: T2<U>): void;
declare type Identity<T> = {
    [P in keyof T]: T[P];
};
declare function f61<U>(x: Identity<U>, y: Partial<U>): void;
declare function f62<U>(x: Identity<U>, y: Readonly<U>): void;
declare function f70<T>(x: {
    [P in keyof T]: T[P];
}, y: {
    [P in keyof T]: T[P];
}): void;
declare function f71<T, U extends T>(x: {
    [P in keyof T]: T[P];
}, y: {
    [P in keyof T]: U[P];
}): void;
declare function f72<T, U extends T>(x: {
    [P in keyof T]: T[P];
}, y: {
    [P in keyof U]: U[P];
}): void;
declare function f73<T, K extends keyof T>(x: {
    [P in K]: T[P];
}, y: {
    [P in keyof T]: T[P];
}): void;
declare function f74<T, U extends T, K extends keyof T>(x: {
    [P in K]: T[P];
}, y: {
    [P in keyof U]: U[P];
}): void;
declare function f75<T, U extends T, K extends keyof T>(x: {
    [P in K]: T[P];
}, y: {
    [P in keyof T]: U[P];
}): void;
declare function f76<T, U extends T, K extends keyof T>(x: {
    [P in K]: T[P];
}, y: {
    [P in K]: U[P];
}): void;
