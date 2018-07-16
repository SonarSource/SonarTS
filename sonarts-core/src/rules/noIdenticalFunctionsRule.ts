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
import * as tslint from "tslint";
import * as ts from "typescript";
import { SonarRuleMetaData } from "../sonarRule";
import areEquivalent from "../utils/areEquivalent";
import { findChild, startLineAndCharacter, endLineAndCharacter } from "../utils/navigation";
import { is, isBlock, isArrowFunction } from "../utils/nodes";
import { SonarRuleVisitor, getIssueLocationAtNode } from "../utils/sonarAnalysis";

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-identical-functions",
    description: "",
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-4144",
    type: "maintainability",
    typescriptOnly: false,
  };

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    const visitor = new Visitor(this.getOptions().ruleName);
    visitor.visit(sourceFile);
    const functionBlocks = visitor.functionBlocks;

    if (functionBlocks.length < 2) {
      return [];
    }

    for (let i = 1; i < functionBlocks.length; i++) {
      const duplicatingFunctionBlock = functionBlocks[i];

      for (let j = 0; j < i; j++) {
        const originalFunctionBlock = functionBlocks[j];

        if (areEquivalent(duplicatingFunctionBlock, originalFunctionBlock, true)) {
          visitor
            .addIssue(
              Rule.issueNode(duplicatingFunctionBlock.parent as ts.FunctionLikeDeclaration),
              Rule.message(originalFunctionBlock),
            )
            .addSecondaryLocation(getIssueLocationAtNode(originalFunctionBlock.parent!, "original implementation"));
          break;
        }
      }
    }

    return visitor.getIssues();
  }

  private static message(functionBlock: ts.Block): string {
    const lineOfOriginalFunction = startLineAndCharacter(functionBlock.parent!).line + 1;
    return `Update or refactor this function so that its implementation doesn't duplicate the one on line ${lineOfOriginalFunction}.`;
  }

  private static issueNode(functionNode: ts.FunctionLikeDeclaration) {
    if (is(functionNode, ts.SyntaxKind.FunctionExpression, ts.SyntaxKind.FunctionDeclaration)) {
      return findChild(functionNode, ts.SyntaxKind.FunctionKeyword);
    }

    if (is(functionNode, ts.SyntaxKind.MethodDeclaration, ts.SyntaxKind.GetAccessor, ts.SyntaxKind.SetAccessor)) {
      return findChild(functionNode, ts.SyntaxKind.Identifier, ts.SyntaxKind.StringLiteral);
    }

    if (is(functionNode, ts.SyntaxKind.Constructor)) {
      return findChild(functionNode, ts.SyntaxKind.ConstructorKeyword);
    }

    if (isArrowFunction(functionNode)) {
      return functionNode.equalsGreaterThanToken;
    }

    throw new Error("Unknown function kind " + ts.SyntaxKind[functionNode.kind]);
  }
}

class Visitor extends SonarRuleVisitor {
  public functionBlocks: ts.Block[] = [];

  public visitFunctionLikeDeclaration(node: ts.FunctionLikeDeclaration) {
    const { body } = node;
    if (body && isBlock(body) && Visitor.isBigEnough(body)) {
      this.functionBlocks.push(body);
    }

    super.visitFunctionLikeDeclaration(node);
  }

  private static isBigEnough(block: ts.Block) {
    if (block.statements.length > 0) {
      const firstLine = startLineAndCharacter(block.statements[0]).line;
      const lastLine = endLineAndCharacter(block.statements[block.statements.length - 1]).line;
      return lastLine - firstLine > 1;
    }

    return false;
  }
}
