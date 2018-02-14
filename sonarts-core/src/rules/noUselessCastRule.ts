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
import { is } from "../utils/nodes";
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

    if (compatibleTypes.includes(typeToCast)) {
      this.addIssue(assertionExpression, Rule.MESSAGE_CAST);
    }
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
