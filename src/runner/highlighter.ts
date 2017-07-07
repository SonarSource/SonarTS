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
import * as tslint from "tslint";
import * as ts from "typescript";
import { SonarSensor } from "./sensor";

export class SyntaxHighlighter implements SonarSensor {
  public execute(sourceFile: ts.SourceFile, _: any, output: any): void {
    new HighlighterWalker(output).walk(sourceFile);
  }
}

class HighlighterWalker extends tslint.SyntaxWalker {

  private highlights: any[];

  constructor(output: any) {
    super();
    this.highlights = [];
    output.highlights = this.highlights;
  }

  protected visitNode(node: ts.Node): void {
    switch (node.kind) {
      case ts.SyntaxKind.ThisKeyword : {
        this.highlights.push(highlight(node, "k"));
        return;
      }
      default : {
        if (node.getChildren().length === 0) {
          this.highlights.push(highlight(node, "s"));
          return;
        } else {
          super.visitNode(node);
        }
      }
    }
  }
}

function highlight(node: ts.Node, highlightKind: SonarTypeOfText) {
  const startPosition = node.getSourceFile().getLineAndCharacterOfPosition(node.getStart());
  const endPosition = node.getSourceFile().getLineAndCharacterOfPosition(node.getEnd());
  return {
    startLine : toSonarLine(startPosition.line),
    startCol : startPosition.character,
    endLine : toSonarLine(endPosition.line),
    endCol : endPosition.character,
    textType : highlightKind,
  };
}

function toSonarLine(line: number) {
  return line + 1;
}

export type SonarTypeOfText = "a" | "c" | "cd" | "j" | "k" | "s" | "h" | "p";
