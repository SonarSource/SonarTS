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
    ruleName: "no-duplicated-branches",
    description: "Two branches in a conditional structure should not have exactly the same implementation",
    rationale: tslint.Utils.dedent`
      Having two cases in a switch statement or two branches in an if chain with the same implementation is at best
      duplicate code, and at worst a coding error. If the same logic is truly needed for both instances, then in an if
      chain they should be combined, or for a switch, one should fall through to the other.`,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-1871",
    type: "functionality",
    typescriptOnly: false,
  };

  public static formatMessage(type: string, line: number) {
    return `This ${type}'s code block is the same as the block for the ${type} on line ${line}.`;
  }

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends tslint.RuleWalker {
  public visitIfStatement(node: ts.IfStatement) {
    // don't visit `else if` statements
    if (!node.parent || node.parent.kind !== ts.SyntaxKind.IfStatement) {
      const branches = this.collectIfBranches(node);

      for (let i = 1; i < branches.length; i++) {
        if (this.hasRequiredSize(branches[i])) {
          for (let j = 0; j < i; j++) {
            if (areEquivalent(branches[i], branches[j])) {
              this.addFailureAtNode(branches[i], Rule.formatMessage("branch", this.getLine(branches[j])));
              break;
            }
          }
        }
      }
    }

    super.visitIfStatement(node);
  }

  public visitSwitchStatement(node: ts.SwitchStatement) {
    const { clauses } = node.caseBlock;
    for (let i = 1; i < clauses.length; i++) {
      const firstClauseWithoutBreak = this.takeWithoutBreak(this.expandSingleBlockStatement(clauses[i].statements));

      if (this.hasRequiredSize(firstClauseWithoutBreak)) {
        for (let j = 0; j < i; j++) {
          const secondClauseWithoutBreak = this.takeWithoutBreak(
            this.expandSingleBlockStatement(clauses[j].statements),
          );

          if (areEquivalent(firstClauseWithoutBreak, secondClauseWithoutBreak)) {
            this.addFailureAtNode(clauses[i], Rule.formatMessage("case", this.getLine(clauses[j])));
            break;
          }
        }
      }
    }

    super.visitSwitchStatement(node);
  }

  private hasRequiredSize(node: ts.Node | ts.Node[]) {
    const nodes = Array.isArray(node) ? node : node.getChildren();

    const children = nodes.filter(
      child => child.kind !== ts.SyntaxKind.OpenBraceToken && child.kind !== ts.SyntaxKind.CloseBraceToken,
    );

    return children.length > 0 && this.getLastLine(children[children.length - 1]) > this.getLine(children[0]);
  }

  private collectIfBranches(node: ts.IfStatement) {
    const branches: ts.Statement[] = [node.thenStatement];
    let statement = node.elseStatement;

    while (statement) {
      if (this.isIfStatement(statement)) {
        branches.push(statement.thenStatement);
        statement = statement.elseStatement;
      } else {
        branches.push(statement);
        break;
      }
    }

    return branches;
  }

  private isIfStatement(node: ts.Statement): node is ts.IfStatement {
    return node.kind === ts.SyntaxKind.IfStatement;
  }

  private isBlock(node: ts.Node): node is ts.Block {
    return node.kind === ts.SyntaxKind.Block;
  }

  private getLine(node: ts.Node): number {
    return this.getSourceFile().getLineAndCharacterOfPosition(node.getStart()).line + 1;
  }

  private getLastLine(node: ts.Node): number {
    return this.getSourceFile().getLineAndCharacterOfPosition(node.getEnd()).line + 1;
  }

  private takeWithoutBreak(nodes: ts.Node[]) {
    return nodes.length > 0 && nodes[nodes.length - 1].kind === ts.SyntaxKind.BreakStatement
      ? nodes.slice(0, -1)
      : nodes;
  }

  private expandSingleBlockStatement(nodes: ts.Node[]) {
    return nodes.length === 1 && this.isBlock(nodes[0]) ? (nodes[0] as ts.Block).statements : nodes;
  }
}
