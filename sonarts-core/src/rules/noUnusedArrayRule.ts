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
import { firstAncestor, COMPOUND_ASSIGNMENTS } from "../utils/navigation";
import {
  is,
  isBinaryExpression,
  isElementAccessExpression,
  isCallExpression,
  isPropertyAccessExpression,
  isArrayLiteralExpression,
  isNewExpression,
} from "../utils/nodes";
import { SymbolTableBuilder } from "../symbols/builder";
import { Usage, SymbolTable, UsageFlag } from "../symbols/table";
import { SonarRuleVisitor } from "../utils/sonarAnalysis";

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

  private static readonly WRITE_ARRAY_PATTERNS: ((statement: ts.ExpressionStatement, usage: Usage) => boolean)[] = [
    Rule.isElementWrite,
    Rule.isVariableWrite,
    Rule.isWritingMethodCall,
  ];

  private static readonly MESSAGE = "Either use this collection's contents or remove the collection.";

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    const symbols = SymbolTableBuilder.build(sourceFile, program);

    // walker is created to only save issues
    const visitor = new SonarRuleVisitor(this.getOptions().ruleName);

    // prettier-ignore
    symbols
      .getSymbols()

      // get only symbols storing arrays
      .filter(symbol => Rule.hasCollectionType(symbol, program.getTypeChecker(), symbols))

      // filter out unused symbols
      .filter(symbol => symbols.allUsages(symbol).length > 1)
      
      // map to pair symbol-declaration
      .map(symbol => ({ declaration: Rule.findDeclarationNode(symbol, symbols), symbol}))
      
      // filter out symbols without declaration
      .filter(symbolAndDeclaration => symbolAndDeclaration.declaration)
      .map(symbolAndDeclaration => symbolAndDeclaration as {declaration: ts.Node, symbol: ts.Symbol})      

      // filter out parameters and exported/imported symbols
      .filter(
        symbolAndDeclaration =>
          !firstAncestor(symbolAndDeclaration.declaration, [ts.SyntaxKind.Parameter, ts.SyntaxKind.ImportDeclaration]) &&
          !Rule.isExported(symbolAndDeclaration.declaration),
      )
      
      // keep only symbols initialized to array literal or not initialized at all
      .filter(symbolAndDeclaration => {
        // prettier-ignore
        const varDeclaration = firstAncestor(symbolAndDeclaration.declaration, [ts.SyntaxKind.VariableDeclaration]) as ts.VariableDeclaration;
        if (varDeclaration) {
          if (is(varDeclaration.parent!.parent, ts.SyntaxKind.ForInStatement, ts.SyntaxKind.ForOfStatement)) {
            return false;
          }
          return !varDeclaration.initializer || Rule.isNewCollectionCreation(varDeclaration.initializer);
        }
        return true;
      })
      
      // filter out symbols with at least one read usage
      .filter(symbolAndDeclaration => !symbols.allUsages(symbolAndDeclaration.symbol).some(usage => Rule.isReadUsage(usage)))
      
      // raise issue
      .forEach(symbolAndDeclaration => visitor.addIssue(symbolAndDeclaration.declaration, Rule.MESSAGE));

    return visitor.getIssues();
  }

  private static isExported(declaration: ts.Node): boolean {
    const varStatement = firstAncestor(declaration, [ts.SyntaxKind.VariableStatement]);
    return !!varStatement && is(varStatement.getFirstToken(), ts.SyntaxKind.ExportKeyword);
  }

  private static isReadUsage(usage: Usage): boolean {
    if (usage.is(UsageFlag.DECLARATION)) {
      return false;
    }

    // prettier-ignore
    const expressionStatement = firstAncestor(usage.node, [ts.SyntaxKind.ExpressionStatement]) as ts.ExpressionStatement;

    if (expressionStatement) {
      return !Rule.WRITE_ARRAY_PATTERNS.some(pattern => pattern(expressionStatement, usage));
    }
    return true;
  }

  // myArray = [1, 2];
  private static isVariableWrite({ expression }: ts.ExpressionStatement, usage: Usage) {
    return (
      isBinaryExpression(expression) &&
      is(expression.operatorToken, ts.SyntaxKind.EqualsToken) &&
      expression.left === usage.node &&
      Rule.isNewCollectionCreation(expression.right)
    );
  }

  // myArray[1] = 42;
  // myArray[1] += 42;
  private static isElementWrite({ expression }: ts.ExpressionStatement, usage: Usage) {
    return (
      isBinaryExpression(expression) &&
      is(expression.operatorToken, ts.SyntaxKind.EqualsToken, ...COMPOUND_ASSIGNMENTS) &&
      isElementAccessExpression(expression.left) &&
      expression.left.expression === usage.node
    );
  }

  // myArray.push(1);
  private static isWritingMethodCall(statement: ts.ExpressionStatement, usage: Usage): boolean {
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

    if (isCallExpression(statement.expression)) {
      const callExpression = statement.expression;
      if (isPropertyAccessExpression(callExpression.expression)) {
        const propertyAccess = callExpression.expression;
        return propertyAccess.expression === usage.node && writingMethods.has(propertyAccess.name.text);
      }
    }

    return false;
  }

  private static findDeclarationNode(symbol: ts.Symbol, symbols: SymbolTable): ts.Node | null {
    const declarationUsage = symbols.allUsages(symbol).find(usage => usage.is(UsageFlag.DECLARATION));
    if (!declarationUsage) {
      return null;
    }

    return declarationUsage.node;
  }

  private static hasCollectionType(symbol: ts.Symbol, typeChecker: ts.TypeChecker, symbols: SymbolTable): boolean {
    const usage = symbols.allUsages(symbol)[0];
    const type = typeChecker.getTypeAtLocation(usage.node);
    if (type.symbol) {
      const typeName = type.symbol.name;
      return Rule.isCollectionName(typeName);
    }
    return false;
  }

  private static isNewCollectionCreation(node: ts.Node): boolean {
    if (isArrayLiteralExpression(node)) {
      return true;
    }

    if (isCallExpression(node)) {
      return node.expression.getText() === "Array";
    }

    if (isNewExpression(node)) {
      const constructorName = node.expression.getText();
      return Rule.isCollectionName(constructorName);
    }

    return false;
  }

  private static isCollectionName(str: string): boolean {
    const collections = new Set(["Array", "Set", "Map", "WeakSet", "WeakMap"]);
    return collections.has(str);
  }
}
