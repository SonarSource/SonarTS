//// [noImplicitReturnsInAsync2.ts]
// Should be an error, Promise<number>, currently retorted correctly 
async function test3(isError: boolean = true) {
    if (isError === true) {
        return 6;
    }
}

// Should not be an error, Promise<any>, currently **not** working
async function test4(isError: boolean = true) {  
    if (isError === true) {
        return undefined;
    }
}

// should not be error, Promise<any> currently working correctly 
async function test5(isError: boolean = true): Promise<any> { //should not be error
    if (isError === true) {
        return undefined;
    }
}


// should be error, currently reported correctly 
async function test6(isError: boolean = true): Promise<number> { 
    if (isError === true) {
        return undefined;
    }
}

// infered to be Promise<void>, should not be an error, currently reported correctly 
async function test7(isError: boolean = true) { 
    if (isError === true) {
        return;
    }
}

//// [noImplicitReturnsInAsync2.js]
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Should be an error, Promise<number>, currently retorted correctly 
function test3(isError = true) {
    return __awaiter(this, void 0, void 0, function* () {
        if (isError === true) {
            return 6;
        }
    });
}
// Should not be an error, Promise<any>, currently **not** working
function test4(isError = true) {
    return __awaiter(this, void 0, void 0, function* () {
        if (isError === true) {
            return undefined;
        }
    });
}
// should not be error, Promise<any> currently working correctly 
function test5(isError = true) {
    return __awaiter(this, void 0, void 0, function* () {
        if (isError === true) {
            return undefined;
        }
    });
}
// should be error, currently reported correctly 
function test6(isError = true) {
    return __awaiter(this, void 0, void 0, function* () {
        if (isError === true) {
            return undefined;
        }
    });
}
// infered to be Promise<void>, should not be an error, currently reported correctly 
function test7(isError = true) {
    return __awaiter(this, void 0, void 0, function* () {
        if (isError === true) {
            return;
        }
    });
}
