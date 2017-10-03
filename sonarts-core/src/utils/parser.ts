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
import * as ts from "typescript";

/**
 * Use for test purposes only.
 * Enables:
 * - ES2017
 * - JSX
 */
const TARGET = ts.ScriptTarget.ES2017;

export function parseString(source: string, scriptKind: ts.ScriptKind = ts.ScriptKind.TSX): ts.SourceFile {
  return ts.createSourceFile("filename.ts", source, TARGET, true, scriptKind);
}

/**
 * @throws if parsing error
 */
export function parseFile(filename: string): { sourceFile: ts.SourceFile; program: ts.Program } {
  const compilerOptions = ts.getDefaultCompilerOptions();
  compilerOptions.target = TARGET;
  const program = ts.createProgram([filename], compilerOptions);

  const syntacticDiagnostics = program.getSyntacticDiagnostics();
  if (syntacticDiagnostics.length > 0) {
    const firstError = syntacticDiagnostics[0];
    if (firstError.file != null && firstError.start != null) {
      const pos = firstError.file.getLineAndCharacterOfPosition(firstError.start);
      throw new Error(`Parsing error at position [${pos.line + 1}, ${pos.character}]`);
    }
  }

  return { sourceFile: program.getSourceFile(filename), program };
}
