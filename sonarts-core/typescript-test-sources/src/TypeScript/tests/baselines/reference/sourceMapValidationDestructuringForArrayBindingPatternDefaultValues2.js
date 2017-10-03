//// [sourceMapValidationDestructuringForArrayBindingPatternDefaultValues2.ts]
declare var console: {
    log(msg: any): void;
}
type Robot = [number, string, string];
type MultiSkilledRobot = [string, [string, string]];

let robotA: Robot = [1, "mower", "mowing"];
function getRobot() {
    return robotA;
}

let multiRobotA: MultiSkilledRobot = ["mower", ["mowing", ""]];
let multiRobotB: MultiSkilledRobot = ["trimmer", ["trimming", "edging"]];
function getMultiRobot() {
    return multiRobotA;
}

let nameA: string, primarySkillA: string, secondarySkillA: string;
let numberB: number, nameB: string;
let numberA2: number, nameA2: string, skillA2: string, nameMA: string;
let numberA3: number, robotAInfo: (number | string)[], multiRobotAInfo: (string | [string, string])[];
let i: number;

for ([, nameA = "name"] = robotA, i = 0; i < 1; i++) {
    console.log(nameA);
}
for ([, nameA = "name"] = getRobot(), i = 0; i < 1; i++) {
    console.log(nameA);
}
for ([, nameA = "name"] = [2, "trimmer", "trimming"], i = 0; i < 1; i++) {
    console.log(nameA);
}
for ([, [
    primarySkillA = "primary",
    secondarySkillA = "secondary"
] = ["none", "none"]] = multiRobotA, i = 0; i < 1; i++) {
    console.log(primarySkillA);
}
for ([, [
    primarySkillA = "primary",
    secondarySkillA = "secondary"
] = ["none", "none"]] = getMultiRobot(), i = 0; i < 1; i++) {
    console.log(primarySkillA);
}
for ([, [
    primarySkillA = "primary",
    secondarySkillA = "secondary"
] = ["none", "none"]] = ["trimmer", ["trimming", "edging"]], i = 0; i < 1; i++) {
    console.log(primarySkillA);
}

for ([numberB = -1] = robotA, i = 0; i < 1; i++) {
    console.log(numberB);
}
for ([numberB = -1] = getRobot(), i = 0; i < 1; i++) {
    console.log(numberB);
}
for ([numberB = -1] = [2, "trimmer", "trimming"], i = 0; i < 1; i++) {
    console.log(numberB);
}
for ([nameB = "name"] = multiRobotA, i = 0; i < 1; i++) {
    console.log(nameB);
}
for ([nameB = "name"] = getMultiRobot(), i = 0; i < 1; i++) {
    console.log(nameB);
}
for ([nameB = "name"] = ["trimmer", ["trimming", "edging"]], i = 0; i < 1; i++) {
    console.log(nameB);
}

for ([numberA2 = -1, nameA2 = "name", skillA2 = "skill"] = robotA, i = 0; i < 1; i++) {
    console.log(nameA2);
}
for ([numberA2 = -1, nameA2 = "name", skillA2 = "skill"] = getRobot(), i = 0; i < 1; i++) {
    console.log(nameA2);
}
for ([numberA2 = -1, nameA2 = "name", skillA2 = "skill"] = [2, "trimmer", "trimming"], i = 0; i < 1; i++) {
    console.log(nameA2);
}
for (let
    [nameMA = "noName",
        [
            primarySkillA = "primary",
            secondarySkillA = "secondary"
        ] = ["none", "none"]
    ] = multiRobotA, i = 0; i < 1; i++) {
    console.log(nameMA);
}
for ([nameMA = "noName",
    [
        primarySkillA = "primary",
        secondarySkillA = "secondary"
    ] = ["none", "none"]
] = getMultiRobot(), i = 0; i < 1; i++) {
    console.log(nameMA);
}
for ([nameMA = "noName",
    [
        primarySkillA = "primary",
        secondarySkillA = "secondary"
    ] = ["none", "none"]
] = ["trimmer", ["trimming", "edging"]], i = 0; i < 1; i++) {
    console.log(nameMA);
}

for ([numberA3 = -1, ...robotAInfo] = robotA, i = 0; i < 1; i++) {
    console.log(numberA3);
}
for ([numberA3 = -1, ...robotAInfo] = getRobot(), i = 0; i < 1; i++) {
    console.log(numberA3);
}
for ([numberA3 = -1, ...robotAInfo] = <Robot>[2, "trimmer", "trimming"], i = 0; i < 1; i++) {
    console.log(numberA3);
}

//// [sourceMapValidationDestructuringForArrayBindingPatternDefaultValues2.js]
var robotA = [1, "mower", "mowing"];
function getRobot() {
    return robotA;
}
var multiRobotA = ["mower", ["mowing", ""]];
var multiRobotB = ["trimmer", ["trimming", "edging"]];
function getMultiRobot() {
    return multiRobotA;
}
var nameA, primarySkillA, secondarySkillA;
var numberB, nameB;
var numberA2, nameA2, skillA2, nameMA;
var numberA3, robotAInfo, multiRobotAInfo;
var i;
for (_a = robotA[1], nameA = _a === void 0 ? "name" : _a, robotA, i = 0; i < 1; i++) {
    console.log(nameA);
}
for (_b = getRobot(), _c = _b[1], nameA = _c === void 0 ? "name" : _c, _b, i = 0; i < 1; i++) {
    console.log(nameA);
}
for (_d = [2, "trimmer", "trimming"], _e = _d[1], nameA = _e === void 0 ? "name" : _e, _d, i = 0; i < 1; i++) {
    console.log(nameA);
}
for (_f = multiRobotA[1], _g = _f === void 0 ? ["none", "none"] : _f, _h = _g[0], primarySkillA = _h === void 0 ? "primary" : _h, _j = _g[1], secondarySkillA = _j === void 0 ? "secondary" : _j, multiRobotA, i = 0; i < 1; i++) {
    console.log(primarySkillA);
}
for (_k = getMultiRobot(), _l = _k[1], _m = _l === void 0 ? ["none", "none"] : _l, _o = _m[0], primarySkillA = _o === void 0 ? "primary" : _o, _p = _m[1], secondarySkillA = _p === void 0 ? "secondary" : _p, _k, i = 0; i < 1; i++) {
    console.log(primarySkillA);
}
for (_q = ["trimmer", ["trimming", "edging"]], _r = _q[1], _s = _r === void 0 ? ["none", "none"] : _r, _t = _s[0], primarySkillA = _t === void 0 ? "primary" : _t, _u = _s[1], secondarySkillA = _u === void 0 ? "secondary" : _u, _q, i = 0; i < 1; i++) {
    console.log(primarySkillA);
}
for (_v = robotA[0], numberB = _v === void 0 ? -1 : _v, robotA, i = 0; i < 1; i++) {
    console.log(numberB);
}
for (_w = getRobot(), _x = _w[0], numberB = _x === void 0 ? -1 : _x, _w, i = 0; i < 1; i++) {
    console.log(numberB);
}
for (_y = [2, "trimmer", "trimming"], _z = _y[0], numberB = _z === void 0 ? -1 : _z, _y, i = 0; i < 1; i++) {
    console.log(numberB);
}
for (_0 = multiRobotA[0], nameB = _0 === void 0 ? "name" : _0, multiRobotA, i = 0; i < 1; i++) {
    console.log(nameB);
}
for (_1 = getMultiRobot(), _2 = _1[0], nameB = _2 === void 0 ? "name" : _2, _1, i = 0; i < 1; i++) {
    console.log(nameB);
}
for (_3 = ["trimmer", ["trimming", "edging"]], _4 = _3[0], nameB = _4 === void 0 ? "name" : _4, _3, i = 0; i < 1; i++) {
    console.log(nameB);
}
for (_5 = robotA[0], numberA2 = _5 === void 0 ? -1 : _5, _6 = robotA[1], nameA2 = _6 === void 0 ? "name" : _6, _7 = robotA[2], skillA2 = _7 === void 0 ? "skill" : _7, robotA, i = 0; i < 1; i++) {
    console.log(nameA2);
}
for (_8 = getRobot(), _9 = _8[0], numberA2 = _9 === void 0 ? -1 : _9, _10 = _8[1], nameA2 = _10 === void 0 ? "name" : _10, _11 = _8[2], skillA2 = _11 === void 0 ? "skill" : _11, _8, i = 0; i < 1; i++) {
    console.log(nameA2);
}
for (_12 = [2, "trimmer", "trimming"], _13 = _12[0], numberA2 = _13 === void 0 ? -1 : _13, _14 = _12[1], nameA2 = _14 === void 0 ? "name" : _14, _15 = _12[2], skillA2 = _15 === void 0 ? "skill" : _15, _12, i = 0; i < 1; i++) {
    console.log(nameA2);
}
for (var _16 = multiRobotA[0], nameMA_1 = _16 === void 0 ? "noName" : _16, _17 = multiRobotA[1], _18 = _17 === void 0 ? ["none", "none"] : _17, _19 = _18[0], primarySkillA_1 = _19 === void 0 ? "primary" : _19, _20 = _18[1], secondarySkillA_1 = _20 === void 0 ? "secondary" : _20, i_1 = 0; i_1 < 1; i_1++) {
    console.log(nameMA_1);
}
for (_21 = getMultiRobot(), _22 = _21[0], nameMA = _22 === void 0 ? "noName" : _22, _23 = _21[1], _24 = _23 === void 0 ? ["none", "none"] : _23, _25 = _24[0], primarySkillA = _25 === void 0 ? "primary" : _25, _26 = _24[1], secondarySkillA = _26 === void 0 ? "secondary" : _26, _21, i = 0; i < 1; i++) {
    console.log(nameMA);
}
for (_27 = ["trimmer", ["trimming", "edging"]], _28 = _27[0], nameMA = _28 === void 0 ? "noName" : _28, _29 = _27[1], _30 = _29 === void 0 ? ["none", "none"] : _29, _31 = _30[0], primarySkillA = _31 === void 0 ? "primary" : _31, _32 = _30[1], secondarySkillA = _32 === void 0 ? "secondary" : _32, _27, i = 0; i < 1; i++) {
    console.log(nameMA);
}
for (_33 = robotA[0], numberA3 = _33 === void 0 ? -1 : _33, robotAInfo = robotA.slice(1), robotA, i = 0; i < 1; i++) {
    console.log(numberA3);
}
for (_34 = getRobot(), _35 = _34[0], numberA3 = _35 === void 0 ? -1 : _35, robotAInfo = _34.slice(1), _34, i = 0; i < 1; i++) {
    console.log(numberA3);
}
for (_36 = [2, "trimmer", "trimming"], _37 = _36[0], numberA3 = _37 === void 0 ? -1 : _37, robotAInfo = _36.slice(1), _36, i = 0; i < 1; i++) {
    console.log(numberA3);
}
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37;
//# sourceMappingURL=sourceMapValidationDestructuringForArrayBindingPatternDefaultValues2.js.map