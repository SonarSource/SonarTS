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
import { TreeVisitor } from "../utils/visitor";
import { is, drillDownThroughParenthesis, findChild } from "../utils/navigation";

export function getOverallCognitiveComplexity(node: ts.SourceFile): number {
  let complexityWalker = new ComplexityWalker();
  complexityWalker.visit(node);
  let fileComplexity = complexityWalker.getComplexity().complexity;

  const functionCollector = new FunctionCollector();
  functionCollector.visit(node);

  functionCollector.functionComplexities.forEach(
    functionComplexity => (fileComplexity += functionComplexity.complexity),
  );

  return fileComplexity;
}

function getFunctionCognitiveComplexity(node: ts.FunctionLikeDeclaration) {
  let complexityWalker = new ComplexityWalker();
  complexityWalker.visit(node.body!);
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

export class FunctionCollector extends TreeVisitor {
  public functionComplexities: {
    functionNode: ts.FunctionLikeDeclaration;
    complexity: number;
    nodes: ComplexityNode[];
  }[] = [];

  public visitNode(node: ts.Node): void {
    if (is(node, ...TARGETED_KINDS)) {
      const functionNode = node as ts.FunctionLikeDeclaration;
      const body = functionNode.body as ts.Node;
      if (body) {
        const complexity = getFunctionCognitiveComplexity(node as ts.FunctionLikeDeclaration);
        this.functionComplexities.push({ functionNode, ...complexity });
      }
    }
    super.visitNode(node);
  }
}

export type ComplexityNode = { node: ts.Node; complexity: number };

class ComplexityWalker extends TreeVisitor {
  private complexity = 0;
  private complexityNodes: ComplexityNode[] = [];
  private nesting = 0;
  private logicalOperationsToIgnore: ts.BinaryExpression[] = [];

  public getComplexity(): { complexity: number; nodes: ComplexityNode[] } {
    return { complexity: this.complexity, nodes: this.complexityNodes };
  }

  public visitNode(node: ts.Node) {
    if (!is(node, ...TARGETED_KINDS)) {
      super.visitNode(node);
    }
  }

  public visitIfStatement(node: ts.IfStatement): void {
    const ifToken = findChild(node, ts.SyntaxKind.IfKeyword);

    if (this.isElseIf(node)) {
      this.addComplexityWithoutNesting(ifToken);
    } else {
      this.addComplexityWithNesting(ifToken);
    }

    this.visit(node.expression);
    this.visitWithNesting(node.thenStatement);

    if (node.elseStatement) {
      if (is(node.elseStatement, ts.SyntaxKind.IfStatement)) {
        this.visit(node.elseStatement);
      } else {
        this.addComplexityWithoutNesting(findChild(node, ts.SyntaxKind.ElseKeyword));
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
    this.addComplexityWithNesting(findChild(node, ts.SyntaxKind.SwitchKeyword));
    this.visit(node.expression);
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
      this.addComplexityWithoutNesting(findChild(node, ts.SyntaxKind.ContinueKeyword));
    }
    super.visitContinueStatement(node);
  }

  public visitBreakStatement(node: ts.BreakStatement): void {
    if (node.label) {
      this.addComplexityWithoutNesting(findChild(node, ts.SyntaxKind.BreakKeyword));
    }
    super.visitBreakStatement(node);
  }

  public visitCatchClause(node: ts.CatchClause): void {
    this.addComplexityWithNesting(findChild(node, ts.SyntaxKind.CatchKeyword));
    this.visitWithNesting(node.block);
  }

  public visitForStatement(node: ts.ForStatement): void {
    this.visitLoop(node.statement, ts.SyntaxKind.ForKeyword, node.initializer, node.condition, node.incrementor);
  }

  public visitForInStatement(node: ts.ForInStatement): void {
    this.visitLoop(node.statement, ts.SyntaxKind.ForKeyword, node.initializer, node.expression);
  }

  public visitForOfStatement(node: ts.ForOfStatement): void {
    this.visitLoop(node.statement, ts.SyntaxKind.ForKeyword, node.initializer, node.expression);
  }

  public visitDoStatement(node: ts.DoStatement): void {
    this.visitLoop(node.statement, ts.SyntaxKind.DoKeyword, node.expression);
  }

  public visitWhileStatement(node: ts.WhileStatement): void {
    this.visitLoop(node.statement, ts.SyntaxKind.WhileKeyword, node.expression);
  }

  private visitLoop(
    nestedNode: ts.Node,
    complexityKeyword: ts.SyntaxKind,
    ...notNestedExpressions: (ts.Node | undefined)[]
  ) {
    this.addComplexityWithNesting(findChild(nestedNode.parent!, complexityKeyword));
    this.walkNodes(notNestedExpressions);
    this.visitWithNesting(nestedNode);
  }

  public visitConditionalExpression(node: ts.ConditionalExpression): void {
    this.addComplexityWithNesting(findChild(node, ts.SyntaxKind.QuestionToken));
    this.visit(node.condition);
    this.visitWithNesting(node.whenTrue);
    this.visitWithNesting(node.whenFalse);
  }

  public visitBinaryExpression(node: ts.BinaryExpression): void {
    if (ComplexityWalker.isAndOrOr(node) && !this.isIgnoredOperation(node)) {
      const flattenedLogicalExpressions = this.flattenLogicalExpression(node);

      let previous;
      for (const current of flattenedLogicalExpressions) {
        if (!previous || !is(previous.operatorToken, current.operatorToken.kind)) {
          this.addComplexityWithoutNesting(current.operatorToken);
        }
        previous = current;
      }
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
        this.visit(node);
      }
    }
  }

  private visitWithNesting(node: ts.Node): void {
    this.nesting++;
    this.visit(node);
    this.nesting--;
  }

  private addComplexityWithoutNesting(node: ts.Node): void {
    this.complexity += 1;
    this.complexityNodes.push({ node, complexity: 1 });
  }

  private addComplexityWithNesting(node: ts.Node, value?: number): void {
    const addition = value ? value : 1;
    const nodeComplexity = this.nesting + addition;
    this.complexity += nodeComplexity;
    this.complexityNodes.push({ node, complexity: nodeComplexity });
  }
}
