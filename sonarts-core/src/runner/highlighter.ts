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
import { getComments, getText, is, lineAndCharacter, toTokens } from "../utils/navigation";
import { toSonarLine } from "./sonar-utils";

export default function getHighlighting(sourceFile: ts.SourceFile): { highlights: HighlightedToken[] } {
  const highlights: HighlightedToken[] = [];
  const tokens = toTokens(sourceFile);

  tokens.forEach(token => {
    // KEYWORDS
    if (isKeyword(token)) {
      highlights.push(highlight(token, "keyword"));
    }

    // COMMENTS
    getComments(token).forEach(comment => {
      highlights.push(
        highlightComment(
          comment,
          getText(comment, token.getSourceFile()).startsWith("/**") ? "structured_comment" : "comment",
          token.getSourceFile(),
        ),
      );
    });

    // STRINGS
    const isString = is(
      token,
      ts.SyntaxKind.StringLiteral,
      ts.SyntaxKind.NoSubstitutionTemplateLiteral,
      ts.SyntaxKind.TemplateHead,
      ts.SyntaxKind.TemplateMiddle,
      ts.SyntaxKind.TemplateTail,
    );
    if (isString) {
      highlights.push(highlight(token, "string"));
    }

    // NUMBERS
    if (is(token, ts.SyntaxKind.NumericLiteral)) {
      highlights.push(highlight(token, "constant"));
    }
  });

  return { highlights };
}

function isKeyword(node: ts.Node): boolean {
  return node.kind >= ts.SyntaxKind.BreakKeyword && node.kind <= ts.SyntaxKind.OfKeyword;
}

function highlight(node: ts.Node, highlightKind: SonarTypeOfText): HighlightedToken {
  const startPosition = lineAndCharacter(node.getStart(), node.getSourceFile());
  const endPosition = lineAndCharacter(node.getEnd(), node.getSourceFile());
  return {
    startLine: toSonarLine(startPosition.line),
    startCol: startPosition.character,
    endLine: toSonarLine(endPosition.line),
    endCol: endPosition.character,
    textType: highlightKind,
  };
}

function highlightComment(
  comment: ts.CommentRange,
  highlightKind: SonarTypeOfText,
  file: ts.SourceFile,
): HighlightedToken {
  const startPosition = file.getLineAndCharacterOfPosition(comment.pos);
  const endPosition = file.getLineAndCharacterOfPosition(comment.end);
  return {
    startLine: toSonarLine(startPosition.line),
    startCol: startPosition.character,
    endLine: toSonarLine(endPosition.line),
    endCol: endPosition.character,
    textType: highlightKind,
  };
}

export type SonarTypeOfText = "constant" | "comment" | "structured_comment" | "keyword" | "string";

export interface HighlightedToken {
  startLine: number;
  startCol: number;
  endLine: number;
  endCol: number;
  textType: SonarTypeOfText;
}
