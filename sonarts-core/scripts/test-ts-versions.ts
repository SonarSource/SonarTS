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
import { exec } from "child_process";
import { promisify } from "util";
import * as ora from "ora";

const execPromise = promisify(exec);
const current = getCurrentTS();

function getCurrentTS() {
  const { devDependencies } = require("../package.json");
  return devDependencies["typescript"];
}

function installTS(version: string) {
  return execPromise(`yarn add typescript@${version} --exact --dev --non-interactive`);
}

function runTests() {
  return execPromise(`yarn test --color`);
}

async function runTestsWithTS(version: string) {
  const spinner = ora().start();
  try {
    spinner.text = `Installing TS ${version}`;
    await installTS(version);
    spinner.text = `Testing with TS ${version}`;
    await runTests();
    spinner.succeed(`Tests passed with TS ${version}`);
  } catch (error) {
    spinner.fail(`Tests failed with TS ${version}`);
    console.error(error.stderr);
    throw new Error();
  }
}

async function runAll() {
  await runTestsWithTS("2.5");
  await runTestsWithTS("2.4");
  await runTestsWithTS("2.3");
  await runTestsWithTS("2.2");
}

let runner = process.argv.length > 2 ? runTestsWithTS(process.argv[2]) : runAll();

// install previous TS version after all tests
runner.then(
  () => {
    installTS(current);
  },
  () => {
    installTS(current);
    process.exit(1);
  },
);
