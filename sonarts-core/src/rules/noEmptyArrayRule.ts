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
import { TypedSonarRuleVisitor } from "../utils/sonarAnalysis";
import { SymbolTableBuilder } from "../symbols/builder";
import { getCollectionSymbols, isPotentiallyWriteUsage, SymbolAndDeclaration } from "./utils/collectionUtils";
import { firstAncestor } from "../utils/navigation";
import {
  isArrayLiteralExpression,
  isCallExpression,
  isNewExpression,
  is,
  isPropertyAccessExpression,
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

  public static MESSAGE = "Remove this call; the collection can only be empty here.";

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    const visitor = new Visitor(this.getOptions().ruleName, program);
    const symbols = SymbolTableBuilder.build(sourceFile, program);
    const collectionSymbols = getCollectionSymbols(symbols, program);
    collectionSymbols
      // filter out array declared as fields
      .filter(symbolAndDeclaration => !is(symbolAndDeclaration.declaration.parent, ts.SyntaxKind.PropertyDeclaration))

      // keep only symbols initialized to empty array literal or not initialized at all
      .filter(Rule.hasEmptyCollectionDeclaration)

      // filter out symbols with at least one usage that may modify array content
      .filter(
        symbolAndDeclaration =>
          !symbols.allUsages(symbolAndDeclaration.symbol).some(usage => isPotentiallyWriteUsage(usage)),
      )

      // raise issue
      .forEach(symbolAndDeclaration =>
        symbols
          .allUsages(symbolAndDeclaration.symbol)
          .filter(usage => !usage.is(UsageFlag.DECLARATION))
          // filter out following usages:
          // - "return myArray"
          // - "{ prop: myArray}"
          // - "{ myArray }"
          .filter(usage => !Rule.isAllowedReadUsage(usage))
          .forEach(usage => {
            visitor.addIssue(usage.node, Rule.MESSAGE);
          }),
      );
    return visitor.getIssues();
  }

  private static isAllowedReadUsage(usage: Usage) {
    return (
      is(
        usage.node.parent,
        ts.SyntaxKind.ReturnStatement,
        ts.SyntaxKind.PropertyAssignment,
        ts.SyntaxKind.ShorthandPropertyAssignment,
      ) || Rule.isConcatCall(usage.node)
    );
  }

  private static isConcatCall(node: ts.Node) {
    return isPropertyAccessExpression(node.parent) && node.parent.name.text === "concat";
  }

  private static hasEmptyCollectionDeclaration(symbolAndDeclaration: SymbolAndDeclaration) {
    // prettier-ignore
    const varDeclaration = firstAncestor(symbolAndDeclaration.declaration, [ts.SyntaxKind.VariableDeclaration]) as ts.VariableDeclaration;
    if (varDeclaration && varDeclaration.initializer) {
      const initializer = varDeclaration.initializer;

      return Rule.isEmptyCollection(initializer);
    }
    return true;
  }

  private static isEmptyCollection(node: ts.Node): boolean {
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
}

class Visitor extends TypedSonarRuleVisitor {}
