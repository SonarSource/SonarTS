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

export function parseString(source: string): ts.SourceFile {
  return ts.createSourceFile("filename.ts", source, TARGET, true, ts.ScriptKind.TSX);
}

export function parseFile(filename: string): { sourceFile: ts.SourceFile; program: ts.Program } {
  const compilerOptions = ts.getDefaultCompilerOptions();
  compilerOptions.jsx = ts.JsxEmit.React;
  compilerOptions.target = TARGET;
  const program = ts.createProgram([filename], compilerOptions);
  return { sourceFile: program.getSourceFile(filename), program };
}
