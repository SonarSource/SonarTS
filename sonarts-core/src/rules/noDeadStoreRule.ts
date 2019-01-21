/*
 * SonarTS
 * Copyright (C) 2017-2019 SonarSource SA
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
import { SymbolTableBuilder } from "../symbols/builder";
import { LiveVariableAnalyzer } from "../symbols/lva";
import { SymbolTable, Usage, UsageFlag } from "../symbols/table";
import { floatToTopParenthesis } from "../utils/navigation";
import * as nodes from "../utils/nodes";
import { SonarRuleVisitor } from "../utils/sonarAnalysis";

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    description: "Dead stores should be removed",
    options: null,
    optionsDescription: "",
    rationale: tslint.Utils.dedent`
      A dead store happens when a local variable is assigned a value that is not read by
      any subsequent instruction or when an object property is assigned a value that is not subsequently used.
      Calculating or retrieving a value only to then overwrite it or throw it away, could indicate a serious error in the code.
      Even if it's not an error, it is at best a waste of resources. Therefore all calculated values should be used.`,
    rspecKey: "RSPEC-1854",
    ruleName: "no-dead-store",
    type: "functionality",
    typescriptOnly: false,
  };

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    const symbols = SymbolTableBuilder.build(sourceFile, program);
    return new Visitor(this.getOptions(), symbols).visit(sourceFile).getIssues();
  }
}

class Visitor extends SonarRuleVisitor {
  public constructor(options: tslint.IOptions, private readonly symbols: SymbolTable) {
    super(options.ruleName);
  }

  public visitFunctionLikeDeclaration(node: ts.FunctionLikeDeclaration) {
    const lvaReturn = new LiveVariableAnalyzer(this.symbols).analyzeFunction(node);
    if (lvaReturn) {
      const { deadUsages } = lvaReturn;

      deadUsages.forEach(deadUsage => {
        if (!this.isException(deadUsage)) {
          this.addIssue(deadUsage.node, `Remove this useless assignment to local variable "${deadUsage.symbol.name}".`);
        }
      });
    }

    super.visitFunctionLikeDeclaration(node);
  }

  private isException(usage: Usage) {
    if (!this.symbols.allUsages(usage.symbol).some(u => (u.flags & UsageFlag.DECLARATION) > 0)) {
      return true;
    }
    const { parent } = floatToTopParenthesis(usage.node);
    if (parent && this.isPartOfDestructiringWithRest(parent)) {
      return true;
    }
    if (parent && (nodes.isBindingElement(parent) || nodes.isVariableDeclaration(parent))) {
      return parent.initializer !== undefined && this.isBasicValue(parent.initializer);
    }
    return false;
  }

  private isPartOfDestructiringWithRest(node: ts.Node) {
    return (
      nodes.isBindingElement(node) &&
      node.dotDotDotToken === undefined &&
      node.parent !== undefined &&
      nodes.isObjectBindingPattern(node.parent) &&
      node.parent.elements[node.parent.elements.length - 1].dotDotDotToken !== undefined
    );
  }

  private isBasicValue(expression: ts.Expression): boolean {
    if (nodes.is(expression, ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword, ts.SyntaxKind.NullKeyword)) {
      return true;
    }
    if (nodes.isLiteralExpression(expression)) {
      return ["0", "1", '""', "''"].includes(expression.getText());
    }
    if (nodes.isPrefixUnaryExpression(expression)) {
      return expression.operator === ts.SyntaxKind.MinusToken && this.isBasicValue(expression.operand);
    }
    if (nodes.isArrayLiteralExpression(expression)) {
      return expression.elements.length === 0;
    }
    if (nodes.isObjectLiteralExpression(expression)) {
      return expression.properties.length === 0;
    }
    return false;
  }
}
