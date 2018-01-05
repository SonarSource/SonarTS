/*
 * SonarTS
 * Copyright (C) 2017-2017 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import * as fs from "fs";
import * as path from "path";
import * as stringify from "json-stable-stringify";

const rootFolder = path.join(__dirname, "../../../");
const rspecRuleFolder = path.join(
  rootFolder,
  "sonarts-sq-plugin/sonar-typescript-plugin/src/main/resources/org/sonar/l10n/typescript/rules/typescript",
);
const templatesFolder = path.join(rootFolder, "sonarts-core/resources/new-rule-templates");
const ruleTemplatePath = path.join(templatesFolder, "rule.template_ts");
const unitTestTemplatePath = path.join(templatesFolder, "unitTest.template_ts");
const tslintSonarTSPath = path.join(rootFolder, "sonarts-core/tslint-sonarts.json");
const readmePath = path.join(rootFolder, "README.md");

try {
  run();
} catch (error) {
  console.error(error.message);
  console.error();
  process.exit(1);
}

function run() {
  if (process.argv.length !== 4) {
    showHelp();
    throw new Error(`Invalid number of arguments: expected 2, but got ${process.argv.length - 2}`);
  }

  const rspecId = process.argv[2];
  const ruleClassName = process.argv[3];

  verifyClassName();
  verifyRspecId();

  const ruleNameDash = getDashName();
  const { ruleTitle, rspecKey } = getRuleTitleAndRspecKey();

  //// From README.md:
  //- Add rule key to tslint-sonarts.json
  updateSonarTsJson();

  //- Create file for rule implementation in src/rules. File name should start with lower case and have suffix Rule
  //- Create test folder in test/rules with the name of the rule file
  //- In this folder create files <rule file name>.test.ts and <rule file name>.lint.ts
  createFiles();

  //- In folder docs/rules create rule documentation file <rule key>.md
  createRuleDoc();

  //- In README.md add reference to the documentation file.
  updateReadme();

  // Done!

  /** Adds the rule to `tslint-sonarts.json` and enables it  */
  function updateSonarTsJson() {
    const sonarTsJson = JSON.parse(fs.readFileSync(tslintSonarTSPath, "utf8"));
    sonarTsJson.rules[ruleNameDash] = true;
    fs.writeFileSync(
      tslintSonarTSPath,
      stringify(sonarTsJson, { cmp: (a, b) => (a.key < b.key ? -1 : 1), space: 2 }) + "\n",
    );
  }

  /** Creates rule source and test files from templates */
  function createFiles() {
    const ruleMetadata: { [x: string]: string } = {};
    ruleMetadata["___RULE_NAME_DASH___"] = ruleNameDash;
    ruleMetadata["___RULE_CLASS_NAME___"] = ruleClassName;
    ruleMetadata["___RULE_TITLE___"] = ruleTitle;
    ruleMetadata["___RSPEC_KEY___"] = rspecKey;

    copyWithReplace(
      ruleTemplatePath,
      path.join(rootFolder, `sonarts-core/src/rules/${ruleClassName}.ts`),
      ruleMetadata,
    );

    const testPath = path.join(rootFolder, `sonarts-core/tests/rules/${ruleClassName}`);

    try {
      fs.mkdirSync(testPath);
    } catch {
      // already exists
    }

    copyWithReplace(unitTestTemplatePath, path.join(testPath, `${ruleClassName}.test.ts`), ruleMetadata);

    fs.writeFileSync(path.join(testPath, `${ruleClassName}.lint.ts`), "\n");
  }

  /** Creates the `*.md` documentation file, tries to convert rule description from html to markdown */
  function createRuleDoc() {
    const ruleDescription = `# ${ruleNameDash}\n\n${getDescription()}`;
    fs.writeFileSync(path.join(rootFolder, `sonarts-core/docs/rules/${ruleNameDash}.md`), ruleDescription);
  }

  function getRuleTitleAndRspecKey() {
    try {
      const fileText = fs.readFileSync(path.join(rspecRuleFolder, `${rspecId}.json`), "utf8");
      const ruleData = JSON.parse(fileText);
      return { ruleTitle: ruleData["title"], rspecKey: ruleData["ruleSpecification"] };
    } catch (err) {
      throw new Error("Could not find metadata for the rule. Have you run the rspec-api (with correct parameters)?");
    }
  }

  function getDescription() {
    try {
      const replaceDict: { [x: string]: string } = {};
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

      const fileText = fs.readFileSync(path.join(rspecRuleFolder, `${rspecId}.html`), "utf8");
      return replace(fileText, replaceDict);
    } catch {
      throw new Error("Could not find metadata for the rule. Have you run the rspec-api?");
    }
  }

  function updateReadme() {
    const { head, ruleTitles, ruleLinks, tail } = parseReadme();

    if (ruleTitles.length !== ruleLinks.length) {
      console.log("ruleTitles");
      console.log(ruleTitles);

      console.log("ruleLinks");
      console.log(ruleLinks);

      throw new Error("Could not parse README.md.");
    }

    ruleTitles.push(`* ${ruleTitle} ([\`${ruleNameDash}\`])`);
    ruleLinks.push(`[\`${ruleNameDash}\`]: ./sonarts-core/docs/rules/${ruleNameDash}.md`);

    const linksToTitles: { [x: string]: string } = {};
    for (let i = 0; i < ruleTitles.length; i++) {
      linksToTitles[ruleLinks[i]] = ruleTitles[i];
    }

    const sortedRuleLinks = Object.keys(linksToTitles).sort();
    const sortedRuleTitles = sortedRuleLinks.map(ruleKey => linksToTitles[ruleKey]);

    fs.writeFileSync(readmePath, [...head, ...sortedRuleTitles, "", ...sortedRuleLinks, "", ...tail].join("\n"));
  }

  function parseReadme() {
    const readme = fs.readFileSync(readmePath, "utf8");

    const lines = readme.split("\n");

    const head = [];
    const ruleTitles: string[] = [];
    const ruleLinks: string[] = [];
    const tail: string[] = [];

    // 0: start
    // 1: ## Rules
    // 2: newlines
    // 3: rules
    // 4: newlines
    // 5: rules 2
    // 6: newline
    // 7: after

    let state = 0;

    for (const line of lines) {
      switch (state) {
        case 0:
          if (line.trim() === "## Rules") {
            state = 1;
          }
          head.push(line);
          break;

        case 1:
        case 2:
          if (line.length > 0) {
            state++;
            ruleTitles.push(line);
          } else {
            head.push(line);
          }
          break;

        case 3:
          if (line.length === 0) {
            state++;
          } else {
            ruleTitles.push(line);
          }
          break;

        case 4:
          if (line.length === 0) {
            state++;
          } else {
            ruleLinks.push(line);
          }
          break;

        case 5:
          tail.push(line);
          break;
      }
    }

    return { head, ruleTitles, ruleLinks, tail };
  }

  function verifyClassName() {
    const re = /^[a-z]+([A-Z][a-z0-9]+)*Rule$/;
    if (!ruleClassName.match(re)) {
      throw new Error(`Invalid class name: it should match ${re}, but got "${ruleClassName}"`);
    }
  }

  function verifyRspecId() {
    const re = /^S[0-9]+$/;
    if (!rspecId.match(re)) {
      throw new Error(`Invalid rspec key: it should match ${re}, but got "${rspecId}"`);
    }
  }

  function getDashName() {
    return ruleClassName.slice(0, -4).replace(/([A-Z])/g, letter => "-" + letter.toLowerCase());
  }
}

function showHelp() {
  console.log(`
Before using the script, first run the rule API from SonarTS folder. For example:
  "java -jar /tools/rule-api-1.17.0.1017.jar generate -language ts -rule S4142 -preserve-filenames -no-language-in-filenames

Usage:
  RSPEC-KEY className

Example:
  S4142 myFirstAwesomeRule
  `);
}

function escapeRegExp(str: string) {
  return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replace(text: string, dictionary: { [x: string]: string }): string {
  for (const tok in dictionary) {
    text = text.replace(new RegExp(escapeRegExp(tok), "g"), dictionary[tok]);
  }
  return text;
}

function copyWithReplace(src: string, dest: string, dict: { [x: string]: string }) {
  const content = fs.readFileSync(src, "utf8");
  const newContent = replace(content, dict);
  fs.writeFileSync(dest, newContent);
}
