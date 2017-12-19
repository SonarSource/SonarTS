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
import areEquivalent from "../utils/areEquivalent";
import { is, FUNCTION_LIKE, lineAndCharacter, findChild } from "../utils/navigation";

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
    const walker = new Walker(sourceFile, this.getOptions());
    this.applyWithWalker(walker);
    const functionBlocks = walker.functionBlocks;

    if (functionBlocks.length < 2) {
      return [];
    }

    for (let i = 1; i < functionBlocks.length; i++) {
      const duplicatingFunctionBlock = functionBlocks[i];

      for (let j = 0; j < i; j++) {
        const originalFunctionBlock = functionBlocks[j];

        if (areEquivalent(duplicatingFunctionBlock, originalFunctionBlock)) {
          walker.addFailureAtNode(
            Rule.issueNode(duplicatingFunctionBlock.parent as ts.FunctionLikeDeclaration),
            Rule.message(originalFunctionBlock),
          );
          break;
        }
      }
    }

    return walker.getFailures();
  }

  private static message(functionBlock: ts.Block): string {
    const lineOfOriginalFunction =
      lineAndCharacter(functionBlock.parent!.getStart(), functionBlock.getSourceFile()).line + 1;
    return `Update this function so that its implementation is not identical to the one on line ${lineOfOriginalFunction}.`;
  }

  private static issueNode(functionNode: ts.FunctionLikeDeclaration) {
    if (is(functionNode, ts.SyntaxKind.FunctionExpression, ts.SyntaxKind.FunctionDeclaration)) {
      return findChild(functionNode, ts.SyntaxKind.FunctionKeyword);
    }

    if (is(functionNode, ts.SyntaxKind.MethodDeclaration, ts.SyntaxKind.GetAccessor, ts.SyntaxKind.SetAccessor)) {
      return findChild(functionNode, ts.SyntaxKind.Identifier);
    }

    if (is(functionNode, ts.SyntaxKind.Constructor)) {
      return findChild(functionNode, ts.SyntaxKind.ConstructorKeyword);
    }

    if (is(functionNode, ts.SyntaxKind.ArrowFunction)) {
      return (functionNode as ts.ArrowFunction).equalsGreaterThanToken;
    }

    throw new Error("Unknow function kind " + ts.SyntaxKind[functionNode.kind]);
  }
}

class Walker extends tslint.RuleWalker {
  public functionBlocks: ts.Block[] = [];

  protected visitNode(node: ts.Node): void {
    if (is(node, ...FUNCTION_LIKE)) {
      const body = (node as ts.FunctionLikeDeclaration).body;
      if (is(body, ts.SyntaxKind.Block) && Walker.isBigEnough(body as ts.Block)) {
        this.functionBlocks.push(body as ts.Block);
      }
    }

    super.visitNode(node);
  }

  private static isBigEnough(block: ts.Block) {
    if (block.statements.length > 0) {
      const firstLine = lineAndCharacter(block.statements[0].getStart(), block.getSourceFile()).line;
      const lastLine = lineAndCharacter(block.statements[block.statements.length - 1].getEnd(), block.getSourceFile())
        .line;
      return lastLine - firstLine > 1;
    }

    return false;
  }
}
