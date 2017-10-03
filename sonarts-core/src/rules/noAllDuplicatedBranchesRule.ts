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
    ruleName: "no-all-duplicated-branches",
    description: "All branches in a conditional structure should not have exactly the same implementation",
    rationale: tslint.Utils.dedent`
      Having all branches in a switch or if chain with the same implementation is an error.
      Either a copy-paste error was made and something different should be executed,
      or there shouldn't be a switch/if chain at all. Note that this rule does not apply to
      if chains without else, or to switch without default clauses.`,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-3923",
    type: "functionality",
    typescriptOnly: false,
  };

  public static MESSAGE = "Remove this conditional structure or edit its code blocks so that they're not all the same.";
  public static MESSAGE_CONDITIONAL_EXPRESSION = 'This conditional operation returns the same value whether the condition is "true" or "false".';

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends tslint.RuleWalker {
  public visitIfStatement(node: ts.IfStatement) {
    // don't visit `else if` statements
    if (!node.parent || node.parent.kind !== ts.SyntaxKind.IfStatement) {
      const { branches, endsWithElse } = this.collectIfBranches(node);

      if (endsWithElse && this.allDuplicated(branches)) {
        this.addFailureAtNode(node, Rule.MESSAGE);
      }
    }

    super.visitIfStatement(node);
  }

  public visitSwitchStatement(node: ts.SwitchStatement) {
    const { branches, endsWithDefault } = this.collectSwitchBranches(node);

    if (endsWithDefault && this.allDuplicated(branches)) {
      this.addFailureAtNode(node, Rule.MESSAGE);
    }

    super.visitSwitchStatement(node);
  }

  public visitConditionalExpression(node: ts.ConditionalExpression) {
    const branches = [node.whenTrue, node.whenFalse];

    if (this.allDuplicated(branches)) {
      this.addFailureAtNode(node, Rule.MESSAGE_CONDITIONAL_EXPRESSION);
    }

    super.visitConditionalExpression(node);
  }

  private collectIfBranches(node: ts.IfStatement) {
    const branches: ts.Statement[] = [node.thenStatement];
    let endsWithElse = false;
    let statement = node.elseStatement;

    while (statement) {
      if (this.isIfStatement(statement)) {
        branches.push(statement.thenStatement);
        statement = statement.elseStatement;
      } else {
        branches.push(statement);
        endsWithElse = true;
        break;
      }
    }

    return { branches, endsWithElse };
  }

  private collectSwitchBranches(node: ts.SwitchStatement) {
    let endsWithDefault = false;
    const branches = node.caseBlock.clauses
      .filter((clause, index) => {
        if (clause.kind === ts.SyntaxKind.DefaultClause) {
          endsWithDefault = true;
        }
        // if a branch has no implementation, it's fall-through and it should not be considered
        // the only expection is the last case
        const isLast = index === node.caseBlock.clauses.length - 1;
        return isLast || clause.statements.length > 0;
      })
      .map(clause => this.takeWithoutBreak(clause.statements));
    return { branches, endsWithDefault };
  }

  private takeWithoutBreak(nodes: ts.NodeArray<ts.Node>) {
    return nodes.length > 0 && nodes[nodes.length - 1].kind === ts.SyntaxKind.BreakStatement
      ? nodes.slice(0, -1)
      : nodes;
  }

  private allDuplicated(branches: Branch[]) {
    return branches.length > 1 && branches.slice(1).every((branch, index) => areEquivalent(branches[index], branch));
  }

  private isIfStatement(node: ts.Statement): node is ts.IfStatement {
    return node.kind === ts.SyntaxKind.IfStatement;
  }
}

type Branch = ts.Node | ts.Node[];
