/*
 * SonarTS
 * Copyright (C) 2017-2018 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
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
const javaRuleTemplatePath = path.join(templatesFolder, "rule.template_java");
const unitTestTemplatePath = path.join(templatesFolder, "unitTest.template_ts");
const tslintSonarTSPath = path.join(rootFolder, "sonarts-core/tslint-sonarts.json");
const readmePath = path.join(rootFolder, "README.md");
const typeScriptRulesPath = path.join(
  rootFolder,
  "sonarts-sq-plugin/sonar-typescript-plugin/src/main/java/org/sonar/plugin/typescript/TypeScriptRules.java",
);

try {
  run();
} catch (error) {
  console.error(error.message);
  console.error();
  process.exit(1);
}

function run() {
  if (process.argv.length !== 4 && process.argv.length !== 5) {
    showHelp();
    throw new Error(
      `Invalid number of arguments: expected 2 or 3 (with "javaonly" or "mdonly"), but got ${process.argv.length - 2}`,
    );
  }

  const rspecId = process.argv[2];
  const ruleClassName = process.argv[3];
  const lastParameter = process.argv[4];
  if (!!lastParameter && lastParameter !== "javaonly" && lastParameter !== "mdonly") {
    throw new Error(`'javaonly' or 'mdonly' are expected as last parameter. But '${lastParameter}' was passed`);
  }
  const javaOnly = !!lastParameter && lastParameter !== "javaonly";
  const mdOnly = !!lastParameter && lastParameter !== "mdOnly";

  verifyClassName();
  verifyRspecId();

  const ruleNameDash = getDashName();
  const javaRuleClassName = getJavaClassName();
  const { ruleTitle, rspecKey, ruleType } = getRuleTitleAndRspecKey();

  if (mdOnly) {
    //- In folder docs/rules create rule documentation file <rule key>.md
    createRuleDoc();

    //- In README.md add reference to the documentation file.
    updateReadme();

    return;
  }

  if (!javaOnly) {
    //- Create file for rule implementation in src/rules. File name should start with lower case and have suffix Rule
    //- Create test folder in test/rules with the name of the rule file
    //- In this folder create files <rule file name>.test.ts and <rule file name>.lint.ts
    createTsFiles();

    //- Add rule key to tslint-sonarts.json
    updateSonarTsJson();

    //- In folder docs/rules create rule documentation file <rule key>.md
    createRuleDoc();

    //- In README.md add reference to the documentation file.
    updateReadme();
  }

  //- Create file for rule in java part. File name should start with upper case and NOT have suffix Rule
  createJavaFile();

  // Add java rule class to TypeScriptRules.java
  updateTypeScriptRules();

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

  /** Creates rule typescript source and test files from templates */
  function createTsFiles() {
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

    fs.writeFileSync(path.join(testPath, `${ruleClassName}.lint.ts`), `export const ruleKey = "${rspecId}";\n`);
  }

  /** Creates rule java source from template */
  function createJavaFile() {
    const ruleMetadata: { [x: string]: string } = {};
    ruleMetadata["___RULE_NAME_DASH___"] = ruleNameDash;
    ruleMetadata["___JAVA_RULE_CLASS_NAME___"] = javaRuleClassName;
    ruleMetadata["___RULE_KEY___"] = rspecId;
    copyWithReplace(
      javaRuleTemplatePath,
      path.join(
        rootFolder,
        `sonarts-sq-plugin/sonar-typescript-plugin/src/main/java/org/sonar/plugin/typescript/rules/${javaRuleClassName}.java`,
      ),
      ruleMetadata,
    );
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
      return { ruleTitle: ruleData["title"], rspecKey: ruleData["ruleSpecification"], ruleType: ruleData["type"] };
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
    const { head, bugRuleTitles, middleHead, smellRuleTitles, ruleLinks, tail } = parseReadme();

    if (bugRuleTitles.length + smellRuleTitles.length !== ruleLinks.length) {
      console.log("ruleTitles");
      console.log(bugRuleTitles);
      console.log(smellRuleTitles);

      console.log("ruleLinks");
      console.log(ruleLinks);

      throw new Error("Could not parse README.md.");
    }

    ruleLinks.push(`[\`${ruleNameDash}\`]: ./sonarts-core/docs/rules/${ruleNameDash}.md`);
    const title = `* ${ruleTitle} ([\`${ruleNameDash}\`])`;

    if (ruleType === "BUG") {
      bugRuleTitles.push(title);
    } else {
      smellRuleTitles.push(title);
    }

    ruleLinks.sort();
    bugRuleTitles.sort(compareRuleTitles);
    smellRuleTitles.sort(compareRuleTitles);

    fs.writeFileSync(
      readmePath,
      [...head, ...bugRuleTitles, "", ...middleHead, ...smellRuleTitles, "", ...ruleLinks, "", ...tail].join("\n"),
    );
  }

  function updateTypeScriptRules() {
    const { head1, imports, head2, rules, tail } = parseTypeScriptRules();

    let lastRule = rules[rules.length - 1];
    rules[rules.length - 1] = lastRule + ",";
    rules.push(`      ${javaRuleClassName}.class,`);

    rules.sort();
    lastRule = rules[rules.length - 1];
    rules[rules.length - 1] = lastRule.slice(0, lastRule.length - 1);

    imports.push(`import org.sonar.plugin.typescript.rules.${javaRuleClassName};`);
    imports.sort();

    fs.writeFileSync(typeScriptRulesPath, [...head1, ...imports, ...head2, ...rules, ...tail].join("\n"));
  }

  function retriveRuleKey(ruleTitle: string) {
    const match = ruleTitle.match(/\(\[\`([\w-]+)\`\]\)/);
    if (!match) {
      throw new Error("Can not retrive rule key from title: " + ruleTitle);
    }
    return match[1];
  }

  function compareRuleTitles(title1: string, title2: string) {
    const key1 = retriveRuleKey(title1);
    const key2 = retriveRuleKey(title2);

    if (key1 < key2) {
      return -1;
    } else if (key1 > key2) {
      return 1;
    } else {
      return 0;
    }
  }

  function parseReadme() {
    const readme = fs.readFileSync(readmePath, "utf8");

    const lines = readme.split("\n");

    const head: string[] = [];
    const middleHead: string[] = [];
    const bugRuleTitles: string[] = [];
    const smellRuleTitles: string[] = [];
    const ruleLinks: string[] = [];
    const tail: string[] = [];

    // 0: start
    // 1: ### Bug Detection :bug: + newline + bug desc + newline
    // 2: bug rules + newline
    // 3: ### Code Smell Detection :pig: + newline + code smell desc + newline
    // 4: code smell rules + newline
    // 5: links
    // 6: tail

    let state = 0;

    for (const line of lines) {
      switch (state) {
        case 0:
          processHead(line);
          break;
        case 1:
          processUntilRuleHead(line, head, bugRuleTitles);
          break;
        case 2:
          processRuleTitles(line, bugRuleTitles);
          break;
        case 3:
          processUntilRuleHead(line, middleHead, smellRuleTitles);
          break;
        case 4:
          processRuleTitles(line, smellRuleTitles);
          break;
        case 5:
          processRuleLinks(line);
          break;
        case 6:
          tail.push(line);
          break;
      }
    }

    return { head, bugRuleTitles, middleHead, smellRuleTitles, ruleLinks, tail };

    function processHead(line: string) {
      if (line.trim() === "### Bug Detection :bug:") {
        state = 1;
      }
      head.push(line);
    }

    function processUntilRuleHead(line: string, head: string[], ruleTitles: string[]) {
      if (line.startsWith("*")) {
        state++;
        ruleTitles.push(line);
      } else {
        head.push(line);
      }
    }

    function processRuleTitles(line: string, ruleTitles: string[]) {
      if (line.length === 0) {
        state++;
      } else {
        ruleTitles.push(line);
      }
    }

    function processRuleLinks(line: string) {
      if (line.length === 0) {
        state++;
      } else {
        ruleLinks.push(line);
      }
    }
  }

  function parseTypeScriptRules() {
    const readme = fs.readFileSync(typeScriptRulesPath, "utf8");

    const lines = readme.split("\n");

    const head1: string[] = [];
    const imports: string[] = [];
    const head2: string[] = [];
    const rules: string[] = [];
    const tail: string[] = [];

    let state = 0;

    for (const line of lines) {
      switch (state) {
        case 0:
          processHead1(line);
          break;
        case 1:
          processImports(line);
          break;
        case 2:
          processHead2(line);
          break;
        case 3:
          processRule(line);
          break;
        case 4:
          tail.push(line);
          break;
      }
    }

    return { head1, head2, imports, rules, tail };

    function processHead1(line: string) {
      if (line.trim().startsWith("import")) {
        state++;
        imports.push(line);
      } else {
        head1.push(line);
      }
    }

    function processHead2(line: string) {
      if (line.trim() === "return Collections.unmodifiableList(Arrays.asList(") {
        state++;
      }
      head2.push(line);
    }

    function processImports(line: string) {
      if (!line.trim().startsWith("import")) {
        state++;
        head2.push(line);
      } else {
        imports.push(line);
      }
    }

    function processRule(line: string) {
      if (line.trim() === "));") {
        state++;
        tail.push(line);
      } else {
        rules.push(line);
      }
    }
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

  function getJavaClassName() {
    let name = ruleClassName.slice(0, -4);
    name = name[0].toUpperCase() + name.slice(1);
    return name;
  }
}

function showHelp() {
  console.log(`
Before using the script, first run the rule API from SonarTS folder. For example:
  "java -jar /tools/rule-api-1.17.0.1017.jar generate -language ts -rule S4142 -preserve-filenames -no-language-in-filenames

Usage:
  RSPEC-KEY className [javaonly]

Example:
  S4142 myFirstAwesomeRule
or (if only java classes should be generated):
  S4142 myFirstAwesomeRule javaonly 
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
