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
import { is, isUnionTypeNode } from "../utils/nodes";

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "bool-param-default",
    description: "Optional boolean parameters should have default value",
    rationale: tslint.Utils.dedent``,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-4798",
    type: "maintainability",
    typescriptOnly: true,
  };

  public static message = (parameter: string) =>
    `Provide a default value for '${parameter}' so that the logic of the function is more evident when this parameter is missing.`;

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName).visit(sourceFile).getIssues();
  }
}

class Visitor extends SonarRuleVisitor {
  visitParameterDeclaration(paramDeclaration: ts.ParameterDeclaration) {
    if (!paramDeclaration.initializer && isOptionalBoolean(paramDeclaration)) {
      this.addIssue(paramDeclaration, Rule.message(paramDeclaration.name.getText()));
    }
    super.visitParameterDeclaration(paramDeclaration);
  }
}

function isOptionalBoolean(paramDeclaration: ts.ParameterDeclaration) {
  return usesQuestionOptionalSyntax(paramDeclaration) || usesUnionUndefinedOptinalSyntax(paramDeclaration.type);
}

/**
 * Matches "param?: boolean"
 */
function usesQuestionOptionalSyntax({ questionToken, type }: ts.ParameterDeclaration) {
  return questionToken && is(type, ts.SyntaxKind.BooleanKeyword);
}

/**
 * Matches "boolean | undefined"
 */
function usesUnionUndefinedOptinalSyntax(type?: ts.TypeNode) {
  if (!type || !isUnionTypeNode(type)) {
    return false;
  }
  const { types } = type;
  return (
    types.length === 2 &&
    types.some(t => is(t, ts.SyntaxKind.BooleanKeyword)) &&
    types.some(t => is(t, ts.SyntaxKind.UndefinedKeyword))
  );
}
