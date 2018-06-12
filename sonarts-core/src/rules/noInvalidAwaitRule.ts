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
import { isAny, isUnion } from "../utils/semantics";

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-invalid-await",
    description: '"await" should only be used with promises',
    rationale: tslint.Utils.dedent``,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-4123",
    type: "functionality",
    typescriptOnly: false,
  };

  public static MESSAGE = "Refactor this redundant 'await' on a non-promise.";

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName, program).visit(sourceFile).getIssues();
  }
}

class Visitor extends TypedSonarRuleVisitor {
  visitAwaitExpression(node: ts.AwaitExpression) {
    const awaitedType = this.program.getTypeChecker().getTypeAtLocation(node.expression);

    if (!hasThenMethod(awaitedType) && !isAny(awaitedType) && !isUnion(awaitedType)) {
      this.addIssue(node, Rule.MESSAGE);
    }

    super.visitAwaitExpression(node);
  }
}

function hasThenMethod(type: ts.Type) {
  const thenProperty = type.getProperty("then");
  return Boolean(thenProperty && thenProperty.flags & ts.SymbolFlags.Method);
}
