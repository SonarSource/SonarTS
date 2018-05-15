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

import * as ts from "typescript";
import { lineAndCharacterByPos } from "../utils/navigation";
import { toSonarLine } from "./sonarUtils";

export default function getDiagnostics(sourceFile: ts.SourceFile, program: ts.Program): any[] {
  const diagnostics = program.getSyntacticDiagnostics(sourceFile);
  return diagnostics.filter(diagnostic => diagnostic.category === ts.DiagnosticCategory.Error).map(diagnostic => {
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
    const { line, character } = lineAndCharacterByPos(diagnostic.start!, sourceFile);
    return {
      message,
      line: toSonarLine(line),
      col: character,
    };
  });
}
