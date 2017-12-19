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
import { getCommentsAfter, getCommentsBefore, is } from "../utils/navigation";

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-empty-nested-blocks",
    description: "Nested blocks of code should not be left empty",
    rationale: tslint.Utils.dedent`
      Most of the time a block of code is empty when a piece of code is really missing. So such empty block must be
      either filled or removed.`,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-108",
    type: "functionality",
    typescriptOnly: false,
  };

  public static MESSAGE = "Either remove or fill this block of code.";

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends tslint.RuleWalker {
  public visitBlock(node: ts.Block) {
    if (
      node.statements.length === 0 &&
      !this.hasComments(node) &&
      !this.isLikeFunction(node.parent) &&
      !this.isCatchClause(node.parent) &&
      !this.hasLeadingComment(node.parent)
    ) {
      this.addFailureAtNode(node, Rule.MESSAGE);
    }

    super.visitBlock(node);
  }

  private isLikeFunction(node?: ts.Node): boolean {
    return (
      node != null &&
      is(
        node,
        ts.SyntaxKind.FunctionDeclaration,
        ts.SyntaxKind.FunctionExpression,
        ts.SyntaxKind.Constructor,
        ts.SyntaxKind.MethodDeclaration,
        ts.SyntaxKind.GetAccessor,
        ts.SyntaxKind.SetAccessor,
        ts.SyntaxKind.ArrowFunction,
      )
    );
  }

  private isCatchClause(node?: ts.Node): node is ts.CatchClause {
    return node != null && node.kind === ts.SyntaxKind.CatchClause;
  }

  private hasComments(node: ts.Block): boolean {
    if (node.getChildCount() > 0) {
      const openBrace = node.getChildAt(0);
      const closeBrace = node.getChildAt(node.getChildCount() - 1);
      return getCommentsAfter(openBrace).length > 0 || getCommentsBefore(closeBrace).length > 0;
    } else {
      return false;
    }
  }

  private hasLeadingComment(node?: ts.Node): boolean {
    return node != null && getCommentsBefore(node).length > 0;
  }
}
