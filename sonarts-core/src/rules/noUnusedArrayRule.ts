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
import { SonarRuleVisitor } from "../utils/sonarAnalysis";
import { getCollectionSymbols, isElementWrite, isNewCollectionCreation } from "./utils/collectionUtils";
import { Usage, UsageFlag } from "../symbols/table";
import { firstAncestor } from "../utils/navigation";
import { isBinaryExpression, is, isCallExpression, isPropertyAccessExpression } from "../utils/nodes";

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-unused-array",
    description: "Array contents should be used",
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-4030",
    type: "maintainability",
    typescriptOnly: false,
  };

  private static readonly MESSAGE = "Either use this collection's contents or remove the collection.";

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    const symbols = SymbolTableBuilder.build(sourceFile, program);

    // walker is created to only save issues
    const visitor = new SonarRuleVisitor(this.getOptions().ruleName);

    getCollectionSymbols(symbols, program)
      // filter out symbols with at least one read usage
      .filter(symbolAndDeclaration => !symbols.allUsages(symbolAndDeclaration.symbol).some(usage => isReadUsage(usage)))
      // raise issue
      .forEach(symbolAndDeclaration => visitor.addIssue(symbolAndDeclaration.declaration, Rule.MESSAGE));

    return visitor.getIssues();
  }
}

const writeArrayPatterns: ((statement: ts.ExpressionStatement, usage: Usage) => boolean)[] = [
  isElementWrite,
  isVariableWrite,
  isWritingMethodCall,
];

const writingMethods = new Set([
  "copyWithin",
  "fill",
  "pop",
  "push",
  "reverse",
  "shift",
  "sort",
  "splice",
  "unshift",
  "clear",
  "delete",
  "set",
  "add",
]);

function isReadUsage(usage: Usage): boolean {
  if (usage.is(UsageFlag.DECLARATION)) {
    return false;
  }

  // prettier-ignore
  const expressionStatement = firstAncestor(usage.node, [ts.SyntaxKind.ExpressionStatement]) as ts.ExpressionStatement;

  if (expressionStatement) {
    return !writeArrayPatterns.some(pattern => pattern(expressionStatement, usage));
  }
  return true;
}

/**
 * Detectes expression statements like the following:
 *  myArray = [1, 2];
 */
function isVariableWrite({ expression }: ts.ExpressionStatement, usage: Usage) {
  return (
    isBinaryExpression(expression) &&
    is(expression.operatorToken, ts.SyntaxKind.EqualsToken) &&
    expression.left === usage.node &&
    isNewCollectionCreation(expression.right)
  );
}

/**
 * Detectes expression statements like the following:
 * myArray.push(1);
 */
function isWritingMethodCall(statement: ts.ExpressionStatement, usage: Usage): boolean {
  if (isCallExpression(statement.expression)) {
    const callExpression = statement.expression;
    if (isPropertyAccessExpression(callExpression.expression)) {
      const propertyAccess = callExpression.expression;
      return propertyAccess.expression === usage.node && writingMethods.has(propertyAccess.name.text);
    }
  }

  return false;
}
