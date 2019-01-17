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
import { SonarRuleVisitor } from "../utils/sonarAnalysis";
import { SymbolTableBuilder } from "../symbols/builder";
import { getCollectionSymbols, SymbolAndDeclaration } from "./utils/collectionUtils";
import { firstAncestor, ancestorsChain } from "../utils/navigation";
import {
  isArrayLiteralExpression,
  isCallExpression,
  isNewExpression,
  isPropertyAccessExpression,
  isElementAccessExpression,
  isAssignment,
} from "../utils/nodes";
import { UsageFlag, Usage } from "../symbols/table";

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-empty-array",
    description: "Empty collections should not be accessed or iterated",
    rationale: tslint.Utils.dedent``,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-4158",
    type: "functionality",
    typescriptOnly: false,
  };

  public static MESSAGE = (arrayName: string) => `Review this usage of '${arrayName}' as it can only be empty here.`;

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    // walker is created to only save issues
    const visitor = new SonarRuleVisitor(this.getOptions().ruleName);
    const symbols = SymbolTableBuilder.build(sourceFile, program);
    getCollectionSymbols(symbols, program)
      // keep only symbols initialized to empty array literal or not initialized at all
      .filter(isInitializedToEmpty)

      // filter out symbols with at least one usage that may make array non-empty
      .filter(symbolAndDeclaration => symbols.allUsages(symbolAndDeclaration.symbol).every(usage => isReadUsage(usage)))

      // raise issue
      .forEach(symbolAndDeclaration =>
        symbols
          .allUsages(symbolAndDeclaration.symbol)
          .filter(usage => !usage.is(UsageFlag.DECLARATION))
          .forEach(usage => {
            visitor.addIssue(usage.node, Rule.MESSAGE(symbolAndDeclaration.symbol.name));
          }),
      );
    return visitor.getIssues();
  }
}

const readCollectionPatterns: ((usage: Usage) => boolean)[] = [
  isStrictlyReadingMethodCall,
  isForIterationPattern,
  isElementRead,
];

// Methods that mutate the collection but can't add elements
const nonAdditiveMutatorMethods = [
  // array methods
  "copyWithin",
  "pop",
  "reverse",
  "shift",
  "sort",
  // map, set methods
  "delete",
  "clear",
];
const accessorMethods = [
  // array methods
  "concat",
  "includes",
  "indexOf",
  "join",
  "lastIndexOf",
  "slice",
  "toSource",
  "toString",
  "toLocaleString",
  // map, set methods
  "get",
  "has",
];
const iterationMethods = [
  "entries",
  "every",
  "filter",
  "find",
  "findIndex",
  "forEach",
  "keys",
  "map",
  "reduce",
  "reduceRight",
  "some",
  "values",
];

/**
 * Checks if a symbol usage is strictly read usage (thus can not make array non-empty)
 */
function isReadUsage(usage: Usage) {
  // we are not interested in a declaration usage since we know this array is either initaliazed to an empty literal
  // or not initialized at all
  if (usage.is(UsageFlag.DECLARATION)) {
    return true;
  }
  return readCollectionPatterns.some(pattern => pattern(usage));
}

function isInitializedToEmpty(symbolAndDeclaration: SymbolAndDeclaration) {
  // prettier-ignore
  const varDeclaration = firstAncestor(symbolAndDeclaration.declaration, [ts.SyntaxKind.VariableDeclaration]) as ts.VariableDeclaration;
  if (varDeclaration && varDeclaration.initializer) {
    const initializer = varDeclaration.initializer;

    return isEmptyCollection(initializer);
  }
  return true;
}

function isEmptyCollection(node: ts.Expression): boolean {
  if (isArrayLiteralExpression(node)) {
    return node.elements.length === 0;
  }

  if (isCallExpression(node)) {
    return node.arguments.length === 0;
  }

  if (isNewExpression(node)) {
    return !node.arguments || node.arguments.length === 0;
  }

  return false;
}

function isStrictlyReadingMethodCall(usage: Usage) {
  const strictlyReadingMethods = new Set([...nonAdditiveMutatorMethods, ...accessorMethods, ...iterationMethods]);
  const { parent } = usage.node;
  if (isPropertyAccessExpression(parent) && isCallExpression(parent.parent)) {
    return strictlyReadingMethods.has(parent.name.text);
  }
  return false;
}

function isForIterationPattern(usage: Usage) {
  const forInOrOfStatement = firstAncestor(usage.node, [
    ts.SyntaxKind.ForOfStatement,
    ts.SyntaxKind.ForInStatement,
  ]) as ts.ForInOrOfStatement;
  return forInOrOfStatement && forInOrOfStatement.expression === usage.node;
}

// To detect: x = foo(a[1]);
function isElementRead(usage: Usage) {
  return isElementAccessExpression(usage.node.parent) && !isElementWrite(usage.node.parent);
}

function isElementWrite(elementAccess: ts.ElementAccessExpression) {
  const ancestors = ancestorsChain(elementAccess);
  const assignmentParent = ancestors.find(isAssignment) as ts.BinaryExpression;
  if (assignmentParent) {
    return [elementAccess, ...ancestors].includes(assignmentParent.left);
  }

  return false;
}
