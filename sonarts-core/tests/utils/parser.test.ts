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
import { parseTsConfig } from "../../src/utils/parser";
import { join } from "path";

describe("#parseTsConfig", () => {
  it("should always set traceResolution to false", () => {
    let config = parseTsConfig(join(__dirname, "tsconfigWithTraceResolution.json"));
    expect(config.options.traceResolution).toBe(false);

    config = parseTsConfig(join(__dirname, "tsconfigWithoutTraceResolution.json"));
    expect(config.options.traceResolution).toBe(false);

    config = parseTsConfig(join(__dirname, "tsconfigWithTraceResolutionFalse.json"));
    expect(config.options.traceResolution).toBe(false);
  });
});
