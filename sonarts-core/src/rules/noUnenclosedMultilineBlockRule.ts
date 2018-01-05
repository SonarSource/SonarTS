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
import * as ts from "typescript";
import * as tslint from "tslint";
import { SonarRuleMetaData } from "../sonarRule";
import { lineAndCharacter } from "../utils/navigation";
import { is } from "../utils/nodes";
import { SonarRuleVisitor } from "../utils/sonarAnalysis";

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    description: "Multiline blocks should be enclosed in curly braces",
    options: null,
    optionsDescription: "",
    rspecKey: "RSPEC-2681",
    ruleName: "no-unenclosed-multiline-block",
    type: "functionality",
    typescriptOnly: false,
  };

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName).visit(sourceFile).getIssues();
  }
}

class Visitor extends SonarRuleVisitor {
  protected visitBlock(node: ts.Block): void {
    this.visitStatements(Array.from(node.statements));
    super.visitBlock(node);
  }

  protected visitSourceFile(node: ts.SourceFile): void {
    this.visitStatements(Array.from(node.statements));
    super.visitSourceFile(node);
  }

  protected visitModuleDeclaration(node: ts.ModuleDeclaration): void {
    if (node.body && node.body.kind === ts.SyntaxKind.ModuleBlock) {
      this.visitStatements(Array.from(node.body.statements));
    }
    super.visitModuleDeclaration(node);
  }

  private visitStatements(statements: ts.Statement[]) {
    this.chain(statements)
      .filter(chainedStatements => chainedStatements.areUnenclosed())
      .forEach(unenclosedConsecutives => {
        if (unenclosedConsecutives.areAdjacent()) {
          this.raiseAdjacenceIssue(unenclosedConsecutives);
        } else if (unenclosedConsecutives.areBothIndented()) {
          this.raiseBlockIssue(
            unenclosedConsecutives,
            this.countStatementsInTheSamePile(unenclosedConsecutives.prev, statements),
          );
        } else if (unenclosedConsecutives.areInlinedAndIndented()) {
          this.raiseInlinedAndIndentedIssue(unenclosedConsecutives);
        }
      });
  }

  private chain(statements: ts.Statement[]): ChainedStatements[] {
    return statements
      .reduce((result, statement, i, array) => {
        if (i < array.length - 1) {
          if (this.isConditionOrLoop(statement)) {
            result.push({ prev: statement, next: array[i + 1] });
          }
        }
        return result;
      }, new Array<{ prev: ConditionOrLoop; next: ts.Statement }>())
      .map(pair => {
        return new ChainedStatements(pair.prev, this.extractLastBody(pair.prev), pair.next);
      });
  }

  private isConditionOrLoop(statement: ts.Statement): statement is ConditionOrLoop {
    return is(
      statement,
      ts.SyntaxKind.IfStatement,
      ts.SyntaxKind.ForStatement,
      ts.SyntaxKind.ForInStatement,
      ts.SyntaxKind.ForOfStatement,
      ts.SyntaxKind.WhileStatement,
    );
  }

  private extractLastBody(statement: ConditionOrLoop): ts.Statement {
    if (statement.kind === ts.SyntaxKind.IfStatement) {
      if (!statement.elseStatement) {
        return statement.thenStatement;
      } else {
        return statement.elseStatement;
      }
    } else {
      return statement.statement;
    }
  }

  private countStatementsInTheSamePile(reference: ts.Statement, statements: ts.Statement[]): number {
    const file = reference.getSourceFile();
    let startOfPile = lineAndCharacter(reference.getStart(), file);
    let lastLineOfPile = startOfPile.line;
    for (const statement of statements) {
      const currentLine = lineAndCharacter(statement.getEnd(), file).line;
      const currentIndentation = lineAndCharacter(statement.getStart(), file).character;
      if (currentLine > startOfPile.line) {
        if (currentIndentation === startOfPile.character) {
          lastLineOfPile = lineAndCharacter(statement.getEnd(), file).line;
        } else {
          break;
        }
      }
    }
    return lastLineOfPile - startOfPile.line + 1;
  }

  private raiseAdjacenceIssue(adjacentStatements: ChainedStatements) {
    this.addIssue(
      adjacentStatements.next,
      `This statement will not be executed ${adjacentStatements.includedStatementQualifier()}; ` +
        `only the first statement will be. The rest will execute ${adjacentStatements.excludedStatementsQualifier()}.`,
    );
  }

  private raiseBlockIssue(piledStatements: ChainedStatements, sizeOfPile: number) {
    this.addIssue(
      piledStatements.next,
      `This line will not be executed ${piledStatements.includedStatementQualifier()}; ` +
        `only the first line of this ${sizeOfPile}-line block will be. The rest will execute ${piledStatements.excludedStatementsQualifier()}.`,
    );
  }

  private raiseInlinedAndIndentedIssue(chainedStatements: ChainedStatements) {
    this.addIssue(
      chainedStatements.next,
      `This line will not be executed ${chainedStatements.includedStatementQualifier()}; ` +
        `only the first statement will be. The rest will execute ${chainedStatements.excludedStatementsQualifier()}.`,
    );
  }
}

class ChainedStatements {
  private readonly positions: Positions;

  constructor(readonly topStatement: ConditionOrLoop, readonly prev: ts.Statement, readonly next: ts.Statement) {
    const file = topStatement.getSourceFile();
    this.positions = {
      prevTopStart: lineAndCharacter(this.topStatement.getStart(), file),
      prevTopEnd: lineAndCharacter(this.topStatement.getEnd(), file),
      prevStart: lineAndCharacter(this.prev.getStart(), file),
      prevEnd: lineAndCharacter(this.prev.getEnd(), file),
      nextStart: lineAndCharacter(this.next.getStart(), file),
      nextEnd: lineAndCharacter(this.next.getEnd(), file),
    };
  }

  public areUnenclosed(): boolean {
    return this.prev.kind !== ts.SyntaxKind.Block;
  }

  public areAdjacent(): boolean {
    return this.positions.prevEnd.line === this.positions.nextStart.line;
  }

  public areBothIndented(): boolean {
    return this.positions.prevStart.character === this.positions.nextStart.character && this.prevIsIndented();
  }

  public areInlinedAndIndented(): boolean {
    return (
      this.positions.prevStart.line === this.positions.prevTopEnd.line &&
      this.positions.nextStart.character > this.positions.prevTopStart.character
    );
  }

  public includedStatementQualifier(): string {
    return this.topStatement.kind === ts.SyntaxKind.IfStatement ? "conditionally" : "in a loop";
  }

  public excludedStatementsQualifier(): string {
    return this.topStatement.kind === ts.SyntaxKind.IfStatement ? "unconditionally" : "only once";
  }

  private prevIsIndented(): boolean {
    return this.positions.prevStart.character > this.positions.prevTopStart.character;
  }
}

type Positions = {
  prevTopStart: ts.LineAndCharacter;
  prevTopEnd: ts.LineAndCharacter;
  prevStart: ts.LineAndCharacter;
  prevEnd: ts.LineAndCharacter;
  nextStart: ts.LineAndCharacter;
  nextEnd: ts.LineAndCharacter;
};

type ConditionOrLoop = ts.IfStatement | ts.ForStatement | ts.ForInStatement | ts.ForOfStatement | ts.WhileStatement;
