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
import * as Lint from "tslint";
import * as ts from "typescript";
import {SonarRuleMetaData} from "../sonarRule";
import {descendants, is, isAssignment} from "../utils/navigation";
import {nodeToSonarLine} from "../runner/sonar-utils";

export class Rule extends Lint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    description: "Collection elements should not be replaced unconditionally",
    options: null,
    optionsDescription: "",
    rationale: Lint.Utils.dedent`
      It is highly suspicious when a value is saved for a key or index and then unconditionally overwritten. Such overwrites are likely an error.`,
    rspecKey: "RSPEC-4143",
    ruleName: "no-element-overwrite",
    type: "functionality",
    typescriptOnly: false,
  };

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions(), program));
  }
}

class Walker extends Lint.ProgramAwareRuleWalker {
  public constructor(sourceFile: ts.SourceFile,
                     options: Lint.IOptions,
                     program: ts.Program,) {
    super(sourceFile, options, program);
  }


  protected visitSourceFile(node: ts.SourceFile): void {
    this.checkStatements(node.statements);
    super.visitSourceFile(node);
  }

  protected visitBlock(node: ts.Block): void {
    this.checkStatements(node.statements);
    super.visitBlock(node);
  }

  private checkStatements(statements: Array<ts.Statement>) {
    const usedKeysPerCollection: Map<ts.Symbol, Map<Key, KeyWriteCollectionUsage>> = new Map();
    statements.forEach(statement => {
      const keyWriteUsage = this.keyWriteCollectionUsage(statement);
      if (keyWriteUsage) {
        this.checkCollectionUsage(keyWriteUsage, usedKeysPerCollection);
      } else {
        usedKeysPerCollection.clear();
      }
    });
  }

  private keyWriteCollectionUsage(node: ts.Node): KeyWriteCollectionUsage | undefined {
    if (is(node, ts.SyntaxKind.ExpressionStatement)) {
      const expression = (node as ts.ExpressionStatement).expression;
      return this.arrayUsage(expression) || this.mapUsage(expression) || this.setUsage(expression) || this.propertyUsage(expression);
    }
  }

  private arrayUsage(node: ts.Node): KeyWriteCollectionUsage | undefined {
    if (isAssignment(node) && is(node.left, ts.SyntaxKind.ElementAccessExpression)) {
      const lhs = node.left as ts.ElementAccessExpression;
      const array = this.getTypeChecker().getSymbolAtLocation(lhs.expression);
      if (!array) return;
      if (this.usedInRhs(node.right, array)) return;
      const index = this.extractIndex(lhs.argumentExpression);
      if (!index) return;
      return {
        collectionSymbol: array,
        indexOrKey: index.index,
        indexString: index.indexString,
        node: lhs.expression,
      };
    }
  }

  private usedInRhs(rhs: ts.Expression, symbol: ts.Symbol) {
    return descendants(rhs)
        .filter(child => child.kind === ts.SyntaxKind.Identifier)
        .some(id => this.getTypeChecker().getSymbolAtLocation(id) === symbol);
  }

  private mapUsage(node: ts.Node): KeyWriteCollectionUsage | undefined {
    return this.callExpression(node, "Map", "set");
  }

  private setUsage(node: ts.Node): KeyWriteCollectionUsage | undefined {
    return this.callExpression(node, "Set", "add");
  }

  private callExpression(node: ts.Node, typeName: string, method: string): KeyWriteCollectionUsage | undefined {
    if (is(node, ts.SyntaxKind.CallExpression)) {
      const callExpression = node as ts.CallExpression;
      if (is(callExpression.expression, ts.SyntaxKind.PropertyAccessExpression)) {
        const propertyAccess = callExpression.expression as ts.PropertyAccessExpression;
        const type = this.getTypeChecker().getTypeAtLocation(propertyAccess.expression);
        if (type.symbol && type.symbol.name === typeName && propertyAccess && propertyAccess.name.text === method) {
          const lhsSymbol = this.getTypeChecker().getSymbolAtLocation(propertyAccess.expression);
          if (!lhsSymbol) return;
          const key = this.extractIndex(callExpression.arguments[0]);
          if (!key) return;
          return {
            collectionSymbol: lhsSymbol,
            indexOrKey: key.index,
            indexString: key.indexString,
            node: propertyAccess.expression,
          };
        }
      }
    }
  }

  private propertyUsage(node: ts.Node): KeyWriteCollectionUsage | undefined {
    if (isAssignment(node) && is(node.left, ts.SyntaxKind.PropertyAccessExpression)) {
      const lhs = node.left as ts.PropertyAccessExpression;
      // avoid deeply nested property access
      if (!is(lhs.expression, ts.SyntaxKind.Identifier)) return;
      const objectSymbol = this.getTypeChecker().getSymbolAtLocation(lhs.expression);
      if (!objectSymbol) return;
      if (this.usedInRhs(node.right, objectSymbol)) return;
      const property = lhs.name.text;
      if (!property) return;
      return {
        collectionSymbol: objectSymbol,
        indexOrKey: property,
        indexString: property,
        node: lhs.expression,
      };
    }
  }

  private extractIndex(node?: ts.Node): { index: Key; indexString: string } | undefined {
    if (!node) return;
    if (is(node, ts.SyntaxKind.NumericLiteral, ts.SyntaxKind.StringLiteral)) {
      const literal = node as ts.LiteralLikeNode;
      return {index: literal.text, indexString: literal.text};
    }
    const symbol = this.getTypeChecker().getSymbolAtLocation(node);
    return symbol && {index: symbol, indexString: symbol.name};
  }

  private checkCollectionUsage(collectionUsage: KeyWriteCollectionUsage,
                               collectionUsages: Map<ts.Symbol, Map<Key, KeyWriteCollectionUsage>>,) {
    let indexes = collectionUsages.get(collectionUsage.collectionSymbol);
    if (!indexes) {
      indexes = new Map();
      collectionUsages.set(collectionUsage.collectionSymbol, indexes);
    }
    const previous = indexes.get(collectionUsage.indexOrKey);
    if (previous) {
      this.addFailureAtNode(collectionUsage.node, this.message(collectionUsage.indexString, previous.node));
    }
    indexes.set(collectionUsage.indexOrKey, collectionUsage);
  }

  private message(index: string, previousUsage: ts.Node) {
    const line = nodeToSonarLine(previousUsage);
    return `Verify this is the index that was intended; "${index}" was already set on line ${line}.`;
  }
}

interface KeyWriteCollectionUsage {
  collectionSymbol: ts.Symbol;
  indexOrKey: Key;
  indexString: string; // used for message
  node: ts.Node;
}

type Key = ts.Symbol | string;
