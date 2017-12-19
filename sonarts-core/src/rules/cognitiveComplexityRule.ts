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
import { is } from "../utils/navigation";

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "cognitive-complexity",
    description: "Cognitive Complexity of functions should not be too high",
    rationale: tslint.Utils.dedent`
      Cognitive Complexity is a measure of how hard the control flow of a function is to understand.
      Functions with high Cognitive Complexity will be difficult to maintain.`,
    options: { type: "number" },
    optionsDescription: `The maximum authorized complexity. Default is ${Rule.DEFAULT_THRESHOLD}.`,
    optionExamples: [[true, 10]],
    rspecKey: "RSPEC-3776",
    type: "maintainability",
    typescriptOnly: false,
  };

  private get threshold(): number {
    if (this.ruleArguments[0] !== undefined) {
      return this.ruleArguments[0] as number;
    }
    return Rule.DEFAULT_THRESHOLD;
  }

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return this.applyWithWalker(new FunctionWalker(sourceFile, this.getOptions(), this.threshold));
  }

  public static DEFAULT_THRESHOLD = 15;

  public static TARGETED_KINDS = [
    // ArrowFunctions and FunctionExpressions are included in computation
    ts.SyntaxKind.FunctionDeclaration,
    ts.SyntaxKind.MethodDeclaration,
    ts.SyntaxKind.Constructor,
    ts.SyntaxKind.GetAccessor,
    ts.SyntaxKind.SetAccessor,
  ];
}

class FunctionWalker extends tslint.RuleWalker {
  threshold: number;

  constructor(sourceFile: ts.SourceFile, options: tslint.IOptions, threshold: number) {
    super(sourceFile, options);
    this.threshold = threshold;
  }

  public visitNode(node: ts.Node): void {
    if (is(node, ...Rule.TARGETED_KINDS)) {
      const body = (node as ts.FunctionLikeDeclarationBase).body as ts.Node;
      if (body) {
        const complexity = this.getComplexity(body);
        if (complexity > this.threshold) {
          this.addFailureAtNode(
            FunctionWalker.reportNode(node),
            FunctionWalker.getMessage(node, complexity, this.threshold),
          );
        }
      }
    }
    super.visitNode(node);
  }

  private getComplexity(node: ts.Node): number {
    let complexityWalker = new ComplexityWalker(this.getSourceFile(), this.getOptions());
    complexityWalker.walk(node);
    return complexityWalker.getComplexity();
  }

  private static reportNode(node: ts.Node): ts.Node {
    let reportNode;
    switch (node.kind) {
      case ts.SyntaxKind.FunctionDeclaration:
        reportNode = (node as ts.FunctionDeclaration).name;
        break;
      case ts.SyntaxKind.MethodDeclaration:
        reportNode = (node as ts.MethodDeclaration).name;
        break;
      case ts.SyntaxKind.Constructor:
        reportNode = node.getFirstToken();
        break;
      case ts.SyntaxKind.GetAccessor:
        reportNode = (node as ts.GetAccessorDeclaration).name;
        break;
      case ts.SyntaxKind.SetAccessor:
        reportNode = (node as ts.SetAccessorDeclaration).name;
        break;
    }
    if (!reportNode) {
      return node;
    }
    return reportNode;
  }

  private static getMessage(node: ts.Node, complexity: number, threshold: number): string {
    const functionName = FunctionWalker.getFunctionName(node);
    return `Refactor this ${functionName} to reduce its Cognitive Complexity from ${complexity} to the ${threshold} allowed.`;
  }

  private static getFunctionName(node: ts.Node): string {
    switch (node.kind) {
      case ts.SyntaxKind.MethodDeclaration:
        return "method";
      case ts.SyntaxKind.Constructor:
        return "constructor";
      case ts.SyntaxKind.GetAccessor:
      case ts.SyntaxKind.SetAccessor:
        return "accessor";
      default:
        return "function";
    }
  }
}

class ComplexityWalker extends tslint.RuleWalker {
  private complexity = 0;
  private nesting = 0;
  private logicalOperationsToIgnore: ts.Node[] = [];

  public getComplexity(): number {
    return this.complexity;
  }

  public visitIfStatement(node: ts.IfStatement): void {
    if (this.isEleseIf(node)) {
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

  private isEleseIf(node: ts.IfStatement): boolean {
    return (
      !!node.parent &&
      is(node.parent, ts.SyntaxKind.IfStatement) &&
      node === (node.parent as ts.IfStatement).elseStatement
    );
  }

  public visitSwitchStatement(node: ts.SwitchStatement): void {
    this.addComplexityWithNesting();
    this.walk(node.expression);
    this.visitWithNesting(node.caseBlock);
  }

  public visitClassDeclaration(_node: ts.ClassDeclaration) {
    // do nothing, skip inner classes - its methods complexity will be computed indivudally
  }

  public visitFunctionDeclaration(_node: ts.FunctionDeclaration): void {
    // do nothing, skip inner functions - their own complexity will be computed
  }

  public visitFunctionExpression(node: ts.FunctionExpression): void {
    this.addComplexityWithNesting();
    this.visitWithNesting(node.body);
  }

  public visitArrowFunction(node: ts.ArrowFunction): void {
    this.addComplexityWithNesting();
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
    const opertator = node.operatorToken;
    if (is(opertator, ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken)) {
      const leftChild = ComplexityWalker.skipParentheses(node.left);
      const rightChild = ComplexityWalker.skipParentheses(node.right);

      const leftChildOfSameKind = ComplexityWalker.isOperator(leftChild, opertator.kind);
      const rightChildOfSameKind = ComplexityWalker.isOperator(rightChild, opertator.kind);

      // move always to the leftmost operator
      if (rightChildOfSameKind) {
        this.logicalOperationsToIgnore.push(rightChild);
      }

      if (!this.isIgnoredOperation(node) && !leftChildOfSameKind) {
        this.addComplexityWithoutNesting();
      }
    }
    super.visitBinaryExpression(node);
  }

  private static isOperator(node: ts.Node, operatorKind: ts.BinaryOperator): boolean {
    if (is(node, ts.SyntaxKind.BinaryExpression)) {
      return is((node as ts.BinaryExpression).operatorToken, operatorKind);
    }
    return false;
  }

  private static skipParentheses(node: ts.Node): ts.Node {
    if (is(node, ts.SyntaxKind.ParenthesizedExpression)) {
      return (node as ts.ParenthesizedExpression).expression;
    }
    return node;
  }

  private isIgnoredOperation(node: ts.Node): boolean {
    return this.logicalOperationsToIgnore.indexOf(node) > -1;
  }

  private walkNodes(nodes: (ts.Node | undefined)[]) {
    for (var node of nodes) {
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

  private addComplexityWithNesting(): void {
    this.complexity += this.nesting + 1;
  }
}
