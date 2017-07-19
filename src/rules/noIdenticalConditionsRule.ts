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
import areEquivalent from "../utils/areEquivalent";

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-identical-conditions",
    description: 'Related "if/else if" statements and "cases" in a "switch" should not have the same condition',
    rationale: tslint.Utils.dedent`
      A switch and a chain of if/else if statements is evaluated from top to bottom. At most,
      only one branch will be executed: the first one with a condition that evaluates to true.
      Therefore, duplicating a condition automatically leads to dead code. Usually, this is due to
      a copy/paste error. At best, it's simply dead code and at worst, it's a bug that is likely
      to induce further bugs as the code is maintained, and obviously it could lead to unexpected
      behavior. For a switch, if the first case ends with a break, the second case will never be
      executed, rendering it dead code. Worse there is the risk in this situation that future
      maintenance will be done on the dead case, rather than on the one that's actually used. On the
      other hand, if the first case does not end with a break, both cases will be executed, but
      future maintainers may not notice that.`,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-1862",
    type: "functionality",
    typescriptOnly: false,
  };

  public static formatMessage(expression: string, line: number) {
    return `This ${expression} duplicates the one on line ${line}`;
  }

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends tslint.RuleWalker {
  public visitIfStatement(node: ts.IfStatement) {
    const condition = node.expression;
    let statement = node.elseStatement;
    while (statement) {
      if (this.isIfStatement(statement)) {
        if (areEquivalent(condition, statement.expression)) {
          const { line } = this.getSourceFile().getLineAndCharacterOfPosition(node.getStart());
          this.addFailureAtNode(statement.expression, Rule.formatMessage("branch", line + 1));
        }
        statement = statement.elseStatement;
      } else {
        break;
      }
    }

    super.visitIfStatement(node);
  }

  public visitSwitchStatement(node: ts.SwitchStatement) {
    const clauses = node.caseBlock.clauses.filter(this.isCase) as ts.CaseClause[];

    for (let i = 0; i < clauses.length; i++) {
      for (let j = i + 1; j < clauses.length; j++) {
        if (areEquivalent(clauses[i].expression, clauses[j].expression)) {
          const { line } = this.getSourceFile().getLineAndCharacterOfPosition(clauses[i].expression.getStart());
          this.addFailureAtNode(clauses[j].expression, Rule.formatMessage("case", line + 1));
        }
      }
    }

    super.visitSwitchStatement(node);
  }

  private isIfStatement(statement: ts.Statement): statement is ts.IfStatement {
    return statement.kind === ts.SyntaxKind.IfStatement;
  }

  private isCase(clause: ts.CaseOrDefaultClause): clause is ts.CaseClause {
    return clause.kind === ts.SyntaxKind.CaseClause;
  }
}
