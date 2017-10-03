// @sourcemap: true
declare var console: {
    log(msg: string): void;
}
type MultiSkilledRobot = [string, [string, string]];
var multiRobotA: MultiSkilledRobot = ["mower", ["mowing", ""]];
var multiRobotB: MultiSkilledRobot = ["trimmer", ["trimming", "edging"]];

let [, skillA] = multiRobotA;
let [nameMB] = multiRobotB;
let [nameMA, [primarySkillA, secondarySkillA]] = multiRobotA;

let [nameMC] = ["roomba", ["vaccum", "mopping"]];
let [nameMC2, [primarySkillC, secondarySkillC]] = ["roomba", ["vaccum", "mopping"]];

let [...multiRobotAInfo] = multiRobotA;

if (nameMB == nameMA) {
    console.log(skillA[0] + skillA[1]);
}