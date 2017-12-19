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
import { lineAndCharacter, toTokens } from "../utils/navigation";
import { toSonarLine } from "./sonar-utils";

export default function getCpdTokens(sourceFile: ts.SourceFile): { cpdTokens: CpdToken[] } {
  const cpdTokens: CpdToken[] = [];
  const tokens = toTokens(sourceFile);

  tokens.forEach(token => {
    let text = token.getText();

    if (text.length === 0) {
      // for EndOfFileToken and JsxText tokens containing only whitespaces
      return;
    }

    if (text.startsWith('"') || text.startsWith("'") || text.startsWith("`")) {
      text = "LITERAL";
    }

    const startPosition = lineAndCharacter(token.getStart(), sourceFile);
    const endPosition = lineAndCharacter(token.getEnd(), sourceFile);

    cpdTokens.push({
      startLine: toSonarLine(startPosition.line),
      startCol: startPosition.character,
      endLine: toSonarLine(endPosition.line),
      endCol: endPosition.character,
      image: text,
    });
  });

  return { cpdTokens };
}

export interface CpdToken {
  startLine: number;
  startCol: number;
  endLine: number;
  endCol: number;
  image: string;
}
