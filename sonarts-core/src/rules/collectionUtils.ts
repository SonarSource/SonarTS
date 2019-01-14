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
import { SymbolTable, Usage, UsageFlag } from "../symbols/table";
import * as ts from "typescript";
import { firstAncestor, COMPOUND_ASSIGNMENTS } from "../utils/navigation";
import {
  is,
  isBinaryExpression,
  isElementAccessExpression,
  isCallExpression,
  isPropertyAccessExpression,
  isNewExpression,
  isArrayLiteralExpression,
  isAssignment,
} from "../utils/nodes";

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

const WRITE_ARRAY_PATTERNS: ((statement: ts.ExpressionStatement, usage: Usage) => boolean)[] = [
  isElementWrite,
  isVariableWrite,
  isWritingMethodCall,
];

export type SymbolAndDeclaration = {
  declaration: ts.Node;
  symbol: ts.Symbol;
};

/**
 * Returns an array of pair symbol-declaration storing collections.
 * Parameters, exported/imported and type related symbols are filtered out.
 */
export function getCollectionSymbols(symbols: SymbolTable, program: ts.Program) {
  return (
    symbols
      .getSymbols()

      // get only symbols storing arrays
      .filter(symbol => hasCollectionType(symbol, program.getTypeChecker(), symbols))

      // filter out unused symbols
      .filter(symbol => symbols.allUsages(symbol).length > 1)

      // map to pair symbol-declaration
      .map(symbol => ({ declaration: findDeclarationNode(symbol, symbols), symbol }))

      // filter out symbols without declaration
      .filter(symbolAndDeclaration => symbolAndDeclaration.declaration)
      .map(symbolAndDeclaration => symbolAndDeclaration as { declaration: ts.Node; symbol: ts.Symbol })

      // filter out parameters, exported/imported, type-related symbols
      .filter(
        symbolAndDeclaration =>
          !firstAncestor(
            symbolAndDeclaration.declaration,
            [
              ts.SyntaxKind.Parameter,
              ts.SyntaxKind.ImportDeclaration,
              ts.SyntaxKind.InterfaceDeclaration,
              ts.SyntaxKind.TypeAliasDeclaration,
              ts.SyntaxKind.ModuleDeclaration,
            ],
          ) && !isExported(symbolAndDeclaration.declaration),
      )

      // keep only symbols initialized to array literal or not initialized at all
      .filter(symbolAndDeclaration => {
        // prettier-ignore
        const varDeclaration = firstAncestor(symbolAndDeclaration.declaration, [ts.SyntaxKind.VariableDeclaration]) as ts.VariableDeclaration;
        if (varDeclaration) {
          if (is(varDeclaration.parent.parent, ts.SyntaxKind.ForInStatement, ts.SyntaxKind.ForOfStatement)) {
            return false;
          }
          return !varDeclaration.initializer || isNewCollectionCreation(varDeclaration.initializer);
        }
        return true;
      })
  );
}

export function isReadUsage(usage: Usage): boolean {
  if (usage.is(UsageFlag.DECLARATION)) {
    return false;
  }

  // prettier-ignore
  const expressionStatement = firstAncestor(usage.node, [ts.SyntaxKind.ExpressionStatement]) as ts.ExpressionStatement;

  if (expressionStatement) {
    return !WRITE_ARRAY_PATTERNS.some(pattern => pattern(expressionStatement, usage));
  }
  return true;
}

/**
 * Checks if a symbol usage is potentially modifying the content of the collection.
 * Assumption: collections are  either initaliazed to an empty literal or not initialized at all
 */
export function isPotentiallyWriteUsage(usage: Usage): boolean {
  // we are not interested to declaration usage since we know it's array is either initaliazed to an empty literal
  // or not initialized at all
  if (usage.is(UsageFlag.DECLARATION)) {
    return false;
  }

  // fillArray(myArray) or new fillArray(myArray);
  if (isCallExpression(usage.node.parent) || isNewExpression(usage.node.parent)) {
    return true;
  }
  // myArray = otherArray
  if (isAssignment(usage.node.parent)) {
    return true;
  }

  // for arrow function: (n) => array.push(n)
  if (isPropertyAccessExpression(usage.node.parent) && isCallExpression(usage.node.parent.parent)) {
    const callExpression = usage.node.parent.parent;
    const propertyAccess = callExpression.expression as ts.PropertyAccessExpression;
    return propertyAccess.expression === usage.node && writingMethods.has(propertyAccess.name.text);
  }
  return !isReadUsage(usage);
}

function isExported(declaration: ts.Node): boolean {
  const varStatement = firstAncestor(declaration, [ts.SyntaxKind.VariableStatement]);
  return !!varStatement && is(varStatement.getFirstToken(), ts.SyntaxKind.ExportKeyword);
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
 *  myArray[1] = 42;
 *  myArray[1] += 42;
 */
function isElementWrite({ expression }: ts.ExpressionStatement, usage: Usage) {
  return (
    isBinaryExpression(expression) &&
    is(expression.operatorToken, ts.SyntaxKind.EqualsToken, ...COMPOUND_ASSIGNMENTS) &&
    isElementAccessExpression(expression.left) &&
    expression.left.expression === usage.node
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

function findDeclarationNode(symbol: ts.Symbol, symbols: SymbolTable): ts.Node | null {
  const declarationUsage = symbols.allUsages(symbol).find(usage => usage.is(UsageFlag.DECLARATION));
  if (!declarationUsage) {
    return null;
  }

  return declarationUsage.node;
}

function hasCollectionType(symbol: ts.Symbol, typeChecker: ts.TypeChecker, symbols: SymbolTable): boolean {
  const usage = symbols.allUsages(symbol)[0];
  const type = typeChecker.getTypeAtLocation(usage.node);
  if (type.symbol) {
    const typeName = type.symbol.name;
    return isCollectionName(typeName);
  }
  return false;
}

function isNewCollectionCreation(node: ts.Node): boolean {
  if (isArrayLiteralExpression(node)) {
    return true;
  }

  if (isCallExpression(node)) {
    return node.expression.getText() === "Array";
  }

  if (isNewExpression(node)) {
    const constructorName = node.expression.getText();
    return isCollectionName(constructorName);
  }

  return false;
}

function isCollectionName(str: string): boolean {
  const collections = new Set(["Array", "Set", "Map", "WeakSet", "WeakMap"]);
  return collections.has(str);
}
