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
import { TypedSonarRuleVisitor } from "../utils/sonarAnalysis";
import { TreeVisitor } from "../utils/visitor";
import { findChild } from "../utils/navigation";
import { is, isPropertyAccessExpression, isCallExpression } from "../utils/nodes";

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-try-promise",
    description: "Promise rejections should not be caught by 'try' block",
    rationale: tslint.Utils.dedent``,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-4822",
    type: "functionality",
    typescriptOnly: false,
  };

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName, program).visit(sourceFile).getIssues();
  }
}

class Visitor extends TypedSonarRuleVisitor {
  visitTryStatement(node: ts.TryStatement) {
    if (node.catchClause) {
      // without '.catch()'
      const openPromises: ts.Expression[] = [];
      // with '.catch()'
      const capturedPromises: ts.Expression[] = [];
      let hasPotentiallyThrowingCalls = false;

      FunctionCallVisitor.getCallExpressions(node.tryBlock).forEach(callExpr => {
        const typeChecker = this.program.getTypeChecker();
        const type = typeChecker.getTypeAtLocation(callExpr);
        if (!hasThenMethod(type)) {
          hasPotentiallyThrowingCalls = true;
          return;
        }
        if (is(callExpr.parent, ts.SyntaxKind.AwaitExpression) || isThened(callExpr) || isCatch(callExpr)) {
          return;
        }

        (isCaught(callExpr) ? capturedPromises : openPromises).push(callExpr);
      });

      if (!hasPotentiallyThrowingCalls) {
        this.checkForWrongCatch(node, openPromises);
        this.checkForUselessCatch(node, openPromises, capturedPromises);
      }
    }

    super.visitChildren(node);
  }

  checkForWrongCatch(tryStmt: ts.TryStatement, openPromises: ts.Expression[]) {
    if (openPromises.length > 0) {
      const ending = openPromises.length > 1 ? "s" : "";
      const message = `Consider using 'await' for the promise${ending} inside this 'try' or replace it with 'Promise.prototype.catch(...)' usage${ending}.`;
      const issue = this.addIssue(findChild(tryStmt, ts.SyntaxKind.TryKeyword), message);
      openPromises.forEach(openPromise => issue.addSecondaryLocation(openPromise, "Promise"));
    }
  }

  checkForUselessCatch(tryStmt: ts.TryStatement, openPromises: ts.Expression[], capturedPromises: ts.Expression[]) {
    if (openPromises.length === 0 && capturedPromises.length > 0) {
      const ending = capturedPromises.length > 1 ? "s" : "";
      const message = `Consider removing this 'try' statement as promise${ending} rejection is already captured by '.catch()' method.`;
      const issue = this.addIssue(findChild(tryStmt, ts.SyntaxKind.TryKeyword), message);
      capturedPromises.forEach(capturedPromise => issue.addSecondaryLocation(capturedPromise, "Caught promise"));
    }
  }
}

const isThened = (callExpr: ts.Expression) =>
  isPropertyAccessExpression(callExpr.parent) && callExpr.parent.name.getText() === "then";

const isCaught = (callExpr: ts.Expression) =>
  isPropertyAccessExpression(callExpr.parent) && callExpr.parent.name.getText() === "catch";

const isCatch = (callExpr: ts.Expression) =>
  isCallExpression(callExpr) &&
  isPropertyAccessExpression(callExpr.expression) &&
  callExpr.expression.name.getText() === "catch";

class FunctionCallVisitor extends TreeVisitor {
  private readonly callExpressions: ts.Expression[] = [];

  static getCallExpressions(node: ts.Node) {
    const callVisitor = new FunctionCallVisitor();
    callVisitor.visit(node);

    return callVisitor.callExpressions;
  }

  visitCallExpression(node: ts.CallExpression) {
    this.callExpressions.push(node);
    super.visitChildren(node);
  }

  visitNewExpression(node: ts.NewExpression) {
    this.callExpressions.push(node);
    this.visitChildren(node);
  }

  visitFunctionLikeDeclaration(_: ts.FunctionLikeDeclaration) {
    // do nothing
  }
}

function hasThenMethod(type: ts.Type) {
  const thenProperty = type.getProperty("then");
  return Boolean(thenProperty && thenProperty.flags & ts.SymbolFlags.Method);
}
