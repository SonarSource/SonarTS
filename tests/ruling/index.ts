import * as minimist from "minimist";
import * as utils from "./ruling";

const argv = minimist(process.argv.slice(2), {
  string: ["rule"],
  boolean: ["update"],
});

const rules = utils.getRules(argv.rule);

console.log("Found rules:");
rules.forEach(rule => console.log("  *", (rule as any).metadata.ruleName));
console.log("");

const tsConfigFiles = utils.getTSConfigFiles();

const results = utils.runRules(rules, tsConfigFiles);

if (argv.update) {
  utils.writeResults(results);
} else {
  const passed = utils.checkResults(results);
  if (!passed) {
    process.exitCode = 1;
  }
}
