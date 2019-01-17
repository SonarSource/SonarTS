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
import { isThrowStatement } from "../utils/nodes";
import areEquivalent from "../utils/areEquivalent";
import { findChild } from "../utils/navigation";

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-useless-catch",
    description: `"catch" clauses should do more than rethrow`,
    rationale: tslint.Utils.dedent``,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-2737",
    type: "maintainability",
    typescriptOnly: false,
  };

  public static MESSAGE = "Add logic to this catch clause or eliminate it and rethrow the exception automatically.";

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName).visit(sourceFile).getIssues();
  }
}

class Visitor extends SonarRuleVisitor {
  visitCatchClause(catchClause: ts.CatchClause) {
    const statements = catchClause.block.statements;
    if (statements.length === 1 && onlyRethrows(statements[0], catchClause.variableDeclaration)) {
      this.addIssue(findChild(catchClause, ts.SyntaxKind.CatchKeyword), Rule.MESSAGE);
    }
    super.visitCatchClause(catchClause);
  }
}

function onlyRethrows(statement: ts.Statement, variableDeclaration?: ts.VariableDeclaration) {
  return (
    variableDeclaration &&
    isThrowStatement(statement) &&
    statement.expression &&
    areEquivalent(variableDeclaration.name, statement.expression)
  );
}
