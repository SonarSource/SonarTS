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

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    description: "The output of functions that don't return anything should not be used",
    options: null,
    optionsDescription: "",
    rationale: tslint.Utils.dedent`
      If a function does not return anything, it makes no sense to use its output. Specifically,
      passing it to another function, or assigning its "result" to a variable is probably a bug
      because such functions return undefined, which is probably not what was intended.`,
    rspecKey: "RSPEC-3699",
    ruleName: "no-use-of-empty-return-value",
    type: "functionality",
    typescriptOnly: false,
  };

  public static formatMessage(expression: ts.Expression) {
    if (expression.kind === ts.SyntaxKind.FunctionExpression) {
      return "Remove this use of the output from this function; this function doesn't return anything.";
    } else {
      const name = expression.getText();
      return `Remove this use of the output from "${name}"; "${name}" doesn't return anything.`;
    }
  }

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions(), program));
  }
}

class Walker extends tslint.ProgramAwareRuleWalker {
  public visitCallExpression(node: ts.CallExpression) {
    const type = this.getTypeChecker().getTypeAtLocation(node);
    if (type.flags === ts.TypeFlags.Void && this.isReturnValueUsed(node)) {
      this.addFailureAtNode(node.expression, Rule.formatMessage(this.endOfPropertyChain(node.expression)));
    }

    super.visitCallExpression(node);
  }

  private isReturnValueUsed(node: ts.CallExpression) {
    const parent = this.getParentIgnoreParenthesis(node);

    if (!parent) {
      return false;
    }

    if (this.isBinaryExpression(parent)) {
      if (
        parent.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
        parent.operatorToken.kind === ts.SyntaxKind.BarBarToken
      ) {
        return parent.left === node;
      }

      if (parent.operatorToken.kind === ts.SyntaxKind.CommaToken) {
        return parent.right === node;
      }
    }

    if (parent.kind === ts.SyntaxKind.ConditionalExpression) {
      return (parent as ts.ConditionalExpression).condition === node;
    }

    return (
      parent.kind !== ts.SyntaxKind.ExpressionStatement &&
      parent.kind !== ts.SyntaxKind.ArrowFunction &&
      parent.kind !== ts.SyntaxKind.PrefixUnaryExpression &&
      parent.kind !== ts.SyntaxKind.ReturnStatement &&
      parent.kind !== ts.SyntaxKind.ThrowStatement
    );
  }

  private getParentIgnoreParenthesis(node: ts.Node): ts.Node | undefined {
    const parent = node.parent;
    if (parent && parent.kind === ts.SyntaxKind.ParenthesizedExpression) {
      return this.getParentIgnoreParenthesis(parent);
    }
    return parent;
  }

  private isBinaryExpression(node: ts.Node): node is ts.BinaryExpression {
    return node.kind === ts.SyntaxKind.BinaryExpression;
  }

  private endOfPropertyChain(expression: ts.Expression): ts.Expression {
    if (expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
      return (expression as ts.PropertyAccessExpression).name;
    }
    return expression;
  }
}
