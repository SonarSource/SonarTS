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
import { SonarRuleMetaData } from "../sonarRule";

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-multiline-string-literals",
    description: "Multiline string literals should not be used",
    rationale: tslint.Utils.dedent`
      Continuing a string across a linebreak is supported in most script engines, but it is not a part of ECMAScript.
      Additionally, the whitespace at the beginning of each line can't be safely stripped at compile time, and any
      whitespace after the slash will result in tricky errors.`,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-1516",
    type: "functionality",
    typescriptOnly: false,
  };

  public static MESSAGE = "Use string concatenation rather than line continuation.";

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends tslint.RuleWalker {
  public visitStringLiteral(node: ts.StringLiteral) {
    if (this.isMultiline(node)) {
      this.addFailureAtNode(node, Rule.MESSAGE);
    }

    super.visitStringLiteral(node);
  }

  private isMultiline(node: ts.Node): boolean {
    const startLine = this.getSourceFile().getLineAndCharacterOfPosition(node.getStart()).line;
    const endLine = this.getSourceFile().getLineAndCharacterOfPosition(node.getEnd()).line;
    return endLine > startLine;
  }
}
