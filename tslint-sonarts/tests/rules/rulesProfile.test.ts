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
import { Utils } from "tslint";

it("should contain all implemented rules", () => {
  const rulesPath = path.join(__dirname, "../../src/rules");
  const profileFilePath = path.join(__dirname, "../../tslint-sonarts.json");
  const profile = JSON.parse(fs.readFileSync(profileFilePath, "utf8"));
  const configuredRules = Object.keys(profile.rules)
    .map((key, _) => key)
    .map(Utils.camelize)
    .sort();
  const existingRules = fs
    .readdirSync(rulesPath)
    .map(file => file.substring(0, file.indexOf("Rule.ts")))
    .sort();
  expect(existingRules).toEqual(configuredRules);
});
