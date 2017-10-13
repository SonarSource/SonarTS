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
import { SymbolTableBuilder } from "../symbols/builder";
import { LiveVariableAnalyzer } from "../symbols/lva";
import { SymbolTable, Usage, UsageFlag } from "../symbols/table";
import { descendants, floatToTopParenthesis, FUNCTION_LIKE, is } from "../utils/navigation";

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

  public static formatMessage(deadIdentifier: ts.Identifier) {
    return `Remove this useless assignment to local variable "${deadIdentifier.getText()}".`;
  }

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    const symbols = SymbolTableBuilder.build(sourceFile, program);
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions(), program, symbols));
  }

  public static BASIC_VALUES = ["0", "1", '""', "''"];
}

class Walker extends tslint.ProgramAwareRuleWalker {
  public constructor(
    sourceFile: ts.SourceFile,
    options: tslint.IOptions,
    program: ts.Program,
    private readonly symbols: SymbolTable,
  ) {
    super(sourceFile, options, program);
  }

  protected visitNode(node: ts.Node): void {
    if (is(node, ...FUNCTION_LIKE)) {
      const functionLike = node as ts.FunctionLikeDeclaration;
      new LiveVariableAnalyzer(this.symbols).analyze(functionLike);
      descendants(node)
        .filter(descendant => is(descendant, ts.SyntaxKind.Identifier))
        .forEach(descendant => {
          const identifier = descendant as ts.Identifier;
          const usage = this.symbols.getUsage(identifier);
          if (usage && usage.dead && !this.isException(usage)) {
            this.addFailureAtNode(identifier, Rule.formatMessage(identifier));
          }
        });
    }
    super.visitNode(node);
  }

  private isException(usage: Usage) {
    if (!this.symbols.allUsages(usage.symbol).some(u => (u.flags & UsageFlag.DECLARATION) > 0)) return true;
    const parent = floatToTopParenthesis(usage.node).parent;
    if (is(parent, ts.SyntaxKind.BindingElement, ts.SyntaxKind.VariableDeclaration)) {
      return isBasicValue((parent as ts.BindingElement | ts.VariableDeclaration).initializer);
    }
    return false;
  }
}

function isBasicValue(expression: ts.Expression | undefined): boolean {
  if (!expression) return false;
  if (is(expression, ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword, ts.SyntaxKind.NullKeyword)) return true;
  if (is(expression, ts.SyntaxKind.NumericLiteral, ts.SyntaxKind.StringLiteral))
    return Rule.BASIC_VALUES.includes((expression as ts.LiteralExpression).getText());
  if (is(expression, ts.SyntaxKind.PrefixUnaryExpression)) {
    const unary = expression as ts.PrefixUnaryExpression;
    if (unary.operator === ts.SyntaxKind.MinusToken) return isBasicValue(unary.operand);
    return false;
  }
  if (is(expression, ts.SyntaxKind.ArrayLiteralExpression))
    return (expression as ts.ArrayLiteralExpression).elements.length === 0;
  if (is(expression, ts.SyntaxKind.ObjectLiteralExpression))
    return (expression as ts.ObjectLiteralExpression).properties.length === 0;
  return false;
}
