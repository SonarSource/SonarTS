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

async function runTSC(configPath: string) {
  const spinner = ora(`Type checking "${configPath}"`).start();
  try {
    await execPromise(`./node_modules/.bin/tsc -p ${configPath}`);
    spinner.succeed();
  } catch (error) {
    spinner.fail();
    console.error(error.stdout);
    process.exit(1);
  }
}

async function runAll() {
  await runTSC(".");
  await runTSC("tests");
}

if (process.argv.length > 2) {
  runTSC(process.argv[2]);
} else {
  runAll();
}
