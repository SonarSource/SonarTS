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
import { SonarRuleVisitor } from "../utils/sonarAnalysis";
import { isStringLiteral } from "../utils/nodes";

const DEFAULT_VARIABLE_NAMES = ["password", "pwd", "passwd"];

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-hardcoded-credentials",
    description: "Credentials should not be hard-coded",
    rationale: tslint.Utils.dedent``,
    optionsDescription: "Words matching variables potentially storing hardcoded credentials",
    options: {
      type: "array",
      items: { type: "string" },
    },
    optionExamples: [true, [true, ...DEFAULT_VARIABLE_NAMES]],
    rspecKey: "RSPEC-2068",
    type: "functionality",
    typescriptOnly: false,
  };

  public static MESSAGE = "Review this potentially hardcoded credential.";

  private get variableNames(): string[] {
    return this.ruleArguments.length > 0 ? this.ruleArguments : DEFAULT_VARIABLE_NAMES;
  }

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName, this.variableNames).visit(sourceFile).getIssues();
  }
}

class Visitor extends SonarRuleVisitor {
  private readonly literalRegExp: RegExp[];

  constructor(ruleName: string, private readonly variableNames: string[]) {
    super(ruleName);
    this.literalRegExp = this.variableNames.map(name => new RegExp(name + "=.+"));
  }

  protected visitVariableDeclaration(node: ts.VariableDeclaration): void {
    this.checkAssignment(node.name, node.initializer);
    super.visitVariableDeclaration(node);
  }

  protected visitPropertyAssignment(node: ts.PropertyAssignment): void {
    this.checkAssignment(node.name, node.initializer);
    super.visitPropertyAssignment(node);
  }

  protected visitBinaryExpression(node: ts.BinaryExpression): void {
    if (node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      this.checkAssignment(node.left, node.right);
    }
    super.visitBinaryExpression(node);
  }

  protected visitStringLiteral(node: ts.StringLiteral): void {
    const text = node.getText();
    if (this.literalRegExp.some(regex => regex.test(text))) {
      this.addIssue(node, Rule.MESSAGE);
    }
    super.visitStringLiteral(node);
  }

  private checkAssignment(variable: ts.Node, value?: ts.Node) {
    if (
      value &&
      value.getText().length > 2 &&
      isStringLiteral(value) &&
      this.variableNames.some(name => variable.getText().includes(name))
    ) {
      this.addIssue(value, Rule.MESSAGE);
    }
  }
}
