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
import { toSonarLine } from "./sonarUtils";
import { SymbolTableBuilder } from "../symbols/builder";
import { UsageFlag } from "../symbols/table";
import { startLineAndCharacter, endLineAndCharacter } from "../utils/navigation";

export default function getSymbolHighlighting(sourceFile: ts.SourceFile, program: ts.Program) {
  const symbols: SymbolHighlighting[] = [];
  const symbolTable = SymbolTableBuilder.build(sourceFile, program);
  symbolTable.getSymbols().forEach(symbol => {
    const allUsages = symbolTable.allUsages(symbol);
    const declaration = allUsages.find(usage => Boolean(usage.flags & UsageFlag.DECLARATION));
    if (declaration) {
      const textRange = getTextRange(declaration.node);
      const references = allUsages.filter(usage => !(usage.flags & UsageFlag.DECLARATION));
      symbols.push({ ...textRange, references: references.map(r => getTextRange(r.node)) });
    }
  });
  return { symbols };
}

export interface TextRange {
  startLine: number;
  startCol: number;
  endLine: number;
  endCol: number;
}

export interface SymbolHighlighting extends TextRange {
  references: TextRange[];
}

function getTextRange(node: ts.Node): TextRange {
  const startPosition = startLineAndCharacter(node);
  const endPosition = endLineAndCharacter(node);

  return {
    startLine: toSonarLine(startPosition.line),
    startCol: startPosition.character,
    endLine: toSonarLine(endPosition.line),
    endCol: endPosition.character,
  };
}
