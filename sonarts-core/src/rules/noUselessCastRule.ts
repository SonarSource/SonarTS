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
import { is, isParenthesizedExpression, isPropertyAccessExpression } from "../utils/nodes";
import { TypedSonarRuleVisitor } from "../utils/sonarAnalysis";

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-useless-cast",
    description: "Redundant casts and not-null assertions should be avoided",
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-4325",
    type: "functionality",
    typescriptOnly: false,
  };

  public static MESSAGE_CAST = "Remove this unnecessary cast.";
  public static MESSAGE_ASSERTION = "Remove this unnecessary not-null assertion.";

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName, program).visit(sourceFile).getIssues();
  }
}

class Visitor extends TypedSonarRuleVisitor {
  // for some reason there is no specific "visit..." method for AsExpression
  visitNode(node: ts.Node): void {
    if (is(node, ts.SyntaxKind.AsExpression, ts.SyntaxKind.TypeAssertionExpression)) {
      this.checkTypeCasting(node as ts.AssertionExpression);
    }

    super.visitNode(node);
  }

  visitNonNullExpression(node: ts.NonNullExpression): void {
    const typeAtLocation = this.program.getTypeChecker().getTypeAtLocation(node.expression);

    if (typeAtLocation.getFlags() & ts.TypeFlags.Union) {
      const { types } = typeAtLocation as ts.UnionType;
      if (!types.some(isUndefinedOrNull)) {
        this.addIssue(node, Rule.MESSAGE_ASSERTION);
      }
    } else if (!isUndefinedOrNull(typeAtLocation)) {
      this.addIssue(node, Rule.MESSAGE_ASSERTION);
    }

    super.visitNonNullExpression(node);
  }

  private checkTypeCasting(assertionExpression: ts.AssertionExpression) {
    const { expression, type } = assertionExpression;
    const actualExpressionType = this.program.getTypeChecker().getTypeAtLocation(expression);
    const typeToCast = this.program.getTypeChecker().getTypeFromTypeNode(type);
    const compatibleTypes = [actualExpressionType, ...getBaseTypes(actualExpressionType)];

    if (
      is(expression, ts.SyntaxKind.StringLiteral, ts.SyntaxKind.NumericLiteral) &&
      is(type, ts.SyntaxKind.LiteralType) &&
      expression.kind === (type as ts.LiteralTypeNode).literal.kind
    ) {
      // allow singleton types: '<"a"> "a";' or '0 as 0;'
      return;
    }

    if (
      (is(expression, ts.SyntaxKind.NumericLiteral) && is(type, ts.SyntaxKind.NumberKeyword)) ||
      (is(expression, ts.SyntaxKind.StringLiteral) && is(type, ts.SyntaxKind.StringKeyword)) ||
      this.isUselessPropertyAccessCasting(assertionExpression, actualExpressionType) ||
      compatibleTypes.includes(typeToCast)
    ) {
      this.addIssue(assertionExpression, Rule.MESSAGE_CAST);
    }
  }

  // checks pattern like (myObject as A).foo
  isUselessPropertyAccessCasting({ parent }: ts.AssertionExpression, type: ts.Type) {
    if (isParenthesizedExpression(parent) && isPropertyAccessExpression(parent.parent) && type.isUnion()) {
      const propertyAccess = parent.parent;
      const propertyTypes = type.types
        .map(type => type.getProperty(propertyAccess.name.getText()))
        .map(symbol => this.getType(symbol));
      return propertyTypes.every(signature => !!signature) && new Set(propertyTypes).size === 1;
    }
    return false;
  }

  getType(symbol: ts.Symbol | undefined) {
    if (!symbol) {
      return undefined;
    }
    const declarations = symbol.getDeclarations();
    if (declarations && declarations.length === 1) {
      const { getTypeOfSymbolAtLocation } = this.program.getTypeChecker();
      return getTypeOfSymbolAtLocation(symbol, declarations[0]);
    }
    return undefined;
  }
}

function isUndefinedOrNull(type: ts.Type) {
  return !!(type.flags & ts.TypeFlags.Undefined) || !!(type.flags & ts.TypeFlags.Null);
}

function getBaseTypes(type: ts.Type): ts.Type[] {
  const baseTypes = type.getBaseTypes();
  if (baseTypes) {
    const result: ts.Type[] = [...baseTypes];
    baseTypes.forEach(baseType => result.push(...getBaseTypes(baseType)));
    return result;
  } else {
    return [];
  }
}
