import fs = require("fs");

function showHelp() {
  console.log("");
  console.log("Before using the script, first run the rule API from SonarTS folder. For example:");
  console.log(
    "java -jar /tools/rule-api-1.17.0.1017.jar generate -language ts -rule S4043 -preserve-filenames -no-language-in-filenames ",
  );
  console.log("");
  console.log("Usage:");
  console.log("node main.ts RSPEC-KEY className isTypescriptOnly");
  console.log("");
  console.log("Example:");
  console.log("node main.ts S4043 myFirstAwesomeRule true");
  console.log("");
}

function escapeRegExp(str: string) {
  return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replace(text: string, dictionary): string {
  for (let tok in dictionary) {
    text = text.replace(new RegExp(escapeRegExp(tok), "g"), dictionary[tok]);
  }
  return text;
}

function copyWithReplace(src: string, dest: string, dict) {
  let content = fs.readFileSync(src).toString();
  let newContent = replace(content, dict);
  fs.writeFileSync(dest, newContent);
}

function createFiles(
  rootFolder: string,
  ruleClassName: string,
  ruleNameDash: string,
  ruleTitle: string,
  rspecKey: string,
  isTypescriptOnly: boolean,
) {
  const templatesFolder = `${__dirname}/../templates`;
  const ruleTemplatePath = `${templatesFolder}/rule_template.ts`;

  let dict = {};
  dict["___RULE_NAME_DASH___"] = ruleNameDash;
  dict["___RULE_CLASS_NAME___"] = ruleClassName;
  dict["___RULE_TITLE___"] = ruleTitle;
  dict["___RSPEC_KEY___"] = rspecKey;
  dict["___IS_TYPESCRIPT_ONLY___"] = isTypescriptOnly;

  copyWithReplace(
    `${templatesFolder}/rule_template.ts`,
    `${rootFolder}/sonarts-core/src/rules/${ruleClassName}.ts`,
    dict,
  );

  const testPath = `${rootFolder}/sonarts-core/tests/rules/${ruleClassName}`;

  fs.mkdirSync(`${testPath}`);

  copyWithReplace(`${templatesFolder}/testCase_template.ts`, `${testPath}/${ruleClassName}.test.ts`, dict);

  copyWithReplace(`${templatesFolder}/unitTest_template.ts`, `${testPath}/${ruleClassName}.lint.ts`, dict);
}

function updateSonarTsJson(rootFolder: string, ruleNameDash: string) {
  let sonarTsJson = JSON.parse(fs.readFileSync(`${rootFolder}/sonarts-core/tslint-sonarts.json`).toString());
  sonarTsJson.rules[ruleNameDash] = true;
  fs.writeFileSync(`${rootFolder}/sonarts-core/tslint-sonarts.json`, JSON.stringify(sonarTsJson, null, 2));
}

function getRuleTitleAndRspecKey(rspecRuleFolder: string, rspecId: string) {
  try {
    const fileText = fs.readFileSync(`${rspecRuleFolder}/${rspecId}.json`).toString();

    let ruleData = JSON.parse(fileText);
    return { ruleTitle: ruleData["title"], rspecKey: ruleData["ruleSpecification"] };
  } catch (err) {
    console.error("could not find metadata for the rule. Have you run the rspec-api (with correct parameters)?");
    showHelp();
    throw err;
  }
}

function getDescription(rspecRuleFolder: string, rspecId: string) {
  try {
    let replaceDict = {};
    replaceDict["<em>"] = "";
    replaceDict["</em>"] = "";
    replaceDict["<p>"] = "";
    replaceDict["</p>"] = `\n`;
    replaceDict["<code>"] = "`";
    replaceDict["</code>"] = "`";
    replaceDict["<pre>"] = "```typescript";
    replaceDict["</pre>"] = "```";
    replaceDict["<h2>"] = "## ";
    replaceDict["</h2>"] = `\n`;

    const fileText = fs.readFileSync(`${rspecRuleFolder}/${rspecId}.html`).toString();
    return replace(fileText, replaceDict);
  } catch (err) {
    console.error("could not find metadata for the rule. Have you run the rspec-api?");
    showHelp();
    throw err;
  }
}

function updateReadme(rootFolder: string, ruleTitle: string, ruleNameDash: string) {
  const readmePath = `${rootFolder}/README.md`;
  let readme = fs.readFileSync(readmePath).toString();

  var lines = readme.split("\n");

  let result = new Array();

  let resultsBlock1 = new Array();
  let resultsBlock2 = new Array();
  let resultsBlock3 = new Array();

  let ruleValue = `* ${ruleTitle} ([\`${ruleNameDash}\`])`;
  resultsBlock1.push(ruleValue);
  let ruleKey = `[\`${ruleNameDash}\`]: ./sonarts-core/docs/rules/${ruleNameDash}.md`;
  resultsBlock2.push(ruleKey);

  // 0: start
  // 1: ## Rules
  // 2: newlines
  // 3: rules
  // 4: newlines
  // 5: rules 2
  // 6: newline
  // 7: after

  let state = 0;

  for (var i = 0; i < lines.length; i++) {
    let line = lines[i];

    switch (state) {
      case 0:
        if (line.trim() == "## Rules") {
          state = 1;
        }
        result.push(line);
        break;

      case 1:
      case 2:
        if (line.length > 0) {
          state++;
          resultsBlock1.push(line);
        } else {
          result.push(line);
        }

        break;

      case 3:
        if (line.length == 0) {
          state++;
        } else {
          resultsBlock1.push(line);
        }
        break;

      case 4:
        if (line.length == 0) {
          state++;
        } else {
          resultsBlock2.push(line);
        }
        break;
      case 5:
        resultsBlock3.push(line);
        break;
    }
  }

  if (resultsBlock1.length !== resultsBlock2.length) {
    throw new Error("could not parse README.md!");
  }

  var dict2 = {};
  for (let i = 0; i < resultsBlock1.length; i++) {
    dict2[resultsBlock2[i]] = resultsBlock1[i];
  }

  let keys = Object.keys(dict2).sort();
  let values = new Array();

  for (let i = 0; i < keys.length; i++) {
    values.push(dict2[keys[i]]);
  }

  for (let i = 0; i < values.length; i++) {
    result.push(values[i]);
  }

  result.push("");

  for (let i = 0; i < keys.length; i++) {
    result.push(keys[i]);
  }

  result.push("");

  for (let i = 0; i < resultsBlock3.length; i++) {
    result.push(resultsBlock3[i]);
  }

  let res = result.join("\n");
  fs.writeFileSync(readmePath, res);
}

function verifyClassName(ruleClassName: string) {
  let re = /^[a-z]+([A-Z][a-z0-9]+)*Rule$/;
  if (!ruleClassName.match(re)) {
    throw new Error("invalid class name, does not match " + re);
  }
}

function verifyRspecId(rspecId: string) {
  let re = /^S[0-9]+$/;
  if (!rspecId.match(re)) {
    throw new Error("invalid rspec key, does not match " + re);
  }
}

function getDashName(ruleClassName: string) {
  return ruleClassName.slice(0, -4).replace(/([A-Z])/g, letter => "-" + letter.toLowerCase());
}

const rootFolder = `${__dirname}/../../../..`;
const rspecRuleFolder = `${rootFolder}/sonarts-sq-plugin/sonar-typescript-plugin/src/main/resources/org/sonar/l10n/typescript/rules/typescript`;

if (process.argv.length != 5) {
  showHelp();
  throw new Error("invalid number of arguments");
}

let rspecId = process.argv[2];
const ruleClassName = process.argv[3];
let isTypescriptOnly: boolean = process.argv[4] == "true";

verifyClassName(ruleClassName);
verifyRspecId(rspecId);

const ruleNameDash: string = getDashName(ruleClassName);
const { ruleTitle, rspecKey } = getRuleTitleAndRspecKey(rspecRuleFolder, rspecId);

//// From README.md:
//- Add rule key to tslint-sonarts.json
updateSonarTsJson(rootFolder, ruleNameDash);

//- Create file for rule implementation in src/rules. File name should start with lower case and have suffix Rule
//- Create test folder in test/rules with the name of the rule file
//- In this folder create files <rule file name>.test.ts and <rule file name>.lint.ts
createFiles(rootFolder, ruleClassName, ruleNameDash, ruleTitle, rspecKey, isTypescriptOnly);

//- In folder docs/rules create rule documentation file <rule key>.md
const ruleDescription: string = getDescription(rspecRuleFolder, rspecId);
fs.writeFileSync(`${rootFolder}/sonarts-core/docs/rules/${ruleNameDash}.md`, ruleDescription);

//- In README.md add reference to the documentation file.
updateReadme(rootFolder, ruleTitle, ruleNameDash);
