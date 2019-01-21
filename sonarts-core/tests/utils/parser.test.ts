/*
 * SonarTS
 * Copyright (C) 2017-2019 SonarSource SA
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
import { parseTsConfig } from "../../src/utils/parser";
import { join, parse } from "path";
import { DEFAULT_TSCONFIG } from "../../src/runner/sonartsServer";

describe("#parseTsConfig", () => {
  it("should always set traceResolution to false", () => {
    let config = parseTsConfig(join(__dirname, "tsconfigWithTraceResolution.json"), __dirname);
    expect(config.options.traceResolution).toBe(false);

    config = parseTsConfig(join(__dirname, "tsconfigWithoutTraceResolution.json"), __dirname);
    expect(config.options.traceResolution).toBe(false);

    config = parseTsConfig(join(__dirname, "tsconfigWithTraceResolutionFalse.json"), __dirname);
    expect(config.options.traceResolution).toBe(false);
  });

  it("should use root directory when no tsconfig is found", () => {
    let { options, files } = parseTsConfig(DEFAULT_TSCONFIG, join(__dirname, "fixtures", "missingTsconfig"));
    expect(files).toHaveLength(2);
    expect(files.map(file => parse(file).base).sort()).toEqual(["core.ts", "main.ts"]);
    expect(options).toEqual({ configFilePath: undefined, noEmit: true, traceResolution: false });
  });
});
