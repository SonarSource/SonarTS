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
import * as tslint from "tslint";
import { is, drillDownThroughParenthesis } from "../utils/navigation";

export function getOverallCognitiveComplexity(node: ts.SourceFile): number {
  let complexityWalker = new ComplexityWalker();
  complexityWalker.walk(node);
  let fileComplexity = complexityWalker.getComplexity();

  const functionCollector = new FunctionCollector();
  functionCollector.walk(node);

  functionCollector.functionComplexities.forEach(
    functionComplexity => (fileComplexity += functionComplexity.complexity),
  );

  return fileComplexity;
}

function getFunctionCognitiveComplexity(node: ts.FunctionLikeDeclaration): number {
  let complexityWalker = new ComplexityWalker();
  complexityWalker.walk(node.body!);
  return complexityWalker.getComplexity();
}

const TARGETED_KINDS = [
  // ArrowFunctions and FunctionExpressions are included in computation
  ts.SyntaxKind.FunctionDeclaration,
  ts.SyntaxKind.MethodDeclaration,
  ts.SyntaxKind.Constructor,
  ts.SyntaxKind.GetAccessor,
  ts.SyntaxKind.SetAccessor,
];

export class FunctionCollector extends tslint.SyntaxWalker {
  public functionComplexities: { functionNode: ts.FunctionLikeDeclaration; complexity: number }[] = [];

  public visitNode(node: ts.Node): void {
    if (is(node, ...TARGETED_KINDS)) {
      const functionNode = node as ts.FunctionLikeDeclaration;
      const body = functionNode.body as ts.Node;
      if (body) {
        const complexity = getFunctionCognitiveComplexity(node as ts.FunctionLikeDeclaration);
        this.functionComplexities.push({ functionNode, complexity });
      }
    }
    super.visitNode(node);
  }
}

class ComplexityWalker extends tslint.SyntaxWalker {
  private complexity = 0;
  private nesting = 0;
  private logicalOperationsToIgnore: ts.BinaryExpression[] = [];

  public getComplexity(): number {
    return this.complexity;
  }

  public visitNode(node: ts.Node) {
    if (!is(node, ...TARGETED_KINDS)) {
      super.visitNode(node);
    }
  }

  public visitIfStatement(node: ts.IfStatement): void {
    if (this.isElseIf(node)) {
      this.addComplexityWithoutNesting();
    } else {
      this.addComplexityWithNesting();
    }

    this.walk(node.expression);
    this.visitWithNesting(node.thenStatement);

    if (node.elseStatement) {
      if (is(node.elseStatement, ts.SyntaxKind.IfStatement)) {
        this.walk(node.elseStatement);
      } else {
        this.addComplexityWithoutNesting();
        this.visitWithNesting(node.elseStatement);
      }
    }
  }

  private isElseIf(node: ts.IfStatement): boolean {
    if (node.parent) {
      return is(node.parent, ts.SyntaxKind.IfStatement) && node === (node.parent as ts.IfStatement).elseStatement;
    }
    return false;
  }

  public visitSwitchStatement(node: ts.SwitchStatement): void {
    this.addComplexityWithNesting();
    this.walk(node.expression);
    this.visitWithNesting(node.caseBlock);
  }

  public visitFunctionExpression(node: ts.FunctionExpression): void {
    this.visitWithNesting(node.body);
  }

  public visitArrowFunction(node: ts.ArrowFunction): void {
    this.visitWithNesting(node.body);
  }

  public visitContinueStatement(node: ts.ContinueStatement): void {
    if (node.label) {
      this.addComplexityWithoutNesting();
    }
    super.visitContinueStatement(node);
  }

  public visitBreakStatement(node: ts.BreakStatement): void {
    if (node.label) {
      this.addComplexityWithoutNesting();
    }
    super.visitBreakStatement(node);
  }

  public visitCatchClause(node: ts.CatchClause): void {
    this.addComplexityWithNesting();
    this.visitWithNesting(node.block);
  }

  public visitForStatement(node: ts.ForStatement): void {
    this.visitLoop(node.statement, node.initializer, node.condition, node.incrementor);
  }

  public visitForInStatement(node: ts.ForInStatement): void {
    this.visitLoop(node.statement, node.initializer, node.expression);
  }

  public visitForOfStatement(node: ts.ForOfStatement): void {
    this.visitLoop(node.statement, node.initializer, node.expression);
  }

  public visitDoStatement(node: ts.DoStatement): void {
    this.visitLoop(node.statement, node.expression);
  }

  public visitWhileStatement(node: ts.WhileStatement): void {
    this.visitLoop(node.statement, node.expression);
  }

  private visitLoop(nestedNode: ts.Node, ...notNestedExpressions: (ts.Node | undefined)[]) {
    this.addComplexityWithNesting();
    this.walkNodes(notNestedExpressions);
    this.visitWithNesting(nestedNode);
  }

  public visitConditionalExpression(node: ts.ConditionalExpression): void {
    this.addComplexityWithNesting();
    this.walk(node.condition);
    this.visitWithNesting(node.whenTrue);
    this.visitWithNesting(node.whenFalse);
  }

  public visitBinaryExpression(node: ts.BinaryExpression): void {
    if (ComplexityWalker.isAndOrOr(node) && !this.isIgnoredOperation(node)) {
      const flattenedLogicalExpressions = this.flattenLogicalExpression(node);

      let previous;
      let flattenedComplexity = 0;
      for (const current of flattenedLogicalExpressions) {
        if (!previous || !is(previous.operatorToken, current.operatorToken.kind)) {
          flattenedComplexity++;
        }
        previous = current;
      }
      this.addComplexityWithNesting(flattenedComplexity);
    }
    super.visitBinaryExpression(node);
  }

  private static isAndOrOr(node: ts.Node): boolean {
    if (is(node, ts.SyntaxKind.BinaryExpression)) {
      return is(
        (node as ts.BinaryExpression).operatorToken,
        ts.SyntaxKind.AmpersandAmpersandToken,
        ts.SyntaxKind.BarBarToken,
      );
    }
    return false;
  }

  private flattenLogicalExpression(node: ts.Node): ts.BinaryExpression[] {
    if (ComplexityWalker.isAndOrOr(node)) {
      const binaryExpression = node as ts.BinaryExpression;

      this.logicalOperationsToIgnore.push(binaryExpression);

      const leftChild = drillDownThroughParenthesis(binaryExpression.left);
      const rightChild = drillDownThroughParenthesis(binaryExpression.right);

      return this.flattenLogicalExpression(leftChild)
        .concat([binaryExpression])
        .concat(this.flattenLogicalExpression(rightChild));
    }

    return [];
  }

  private isIgnoredOperation(node: ts.BinaryExpression): boolean {
    return this.logicalOperationsToIgnore.indexOf(node) > -1;
  }

  private walkNodes(nodes: (ts.Node | undefined)[]) {
    for (const node of nodes) {
      if (node) {
        this.walk(node);
      }
    }
  }

  private visitWithNesting(node: ts.Node): void {
    this.nesting++;
    this.walk(node);
    this.nesting--;
  }

  private addComplexityWithoutNesting(): void {
    this.complexity += 1;
  }

  private addComplexityWithNesting(value?: number): void {
    const addition = value ? value : 1;
    this.complexity += this.nesting + addition;
  }
}
