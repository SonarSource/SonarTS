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
import { is } from "../utils/navigation";
import * as tslint from "tslint";
import * as ts from "typescript";
import { SonarRuleMetaData } from "../sonarRule";

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
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }

}

class Walker extends tslint.RuleWalker {

  protected visitBlock(node: ts.Block): void {
    this.visitStatements(node.statements);
    super.visitBlock(node);
  }

  protected visitSourceFile(node: ts.SourceFile): void {
    this.visitStatements(node.statements);
    super.visitSourceFile(node);
  }

  protected visitModuleDeclaration(node: ts.ModuleDeclaration): void {
    if (node.body && node.body.kind === ts.SyntaxKind.ModuleBlock) {
      this.visitStatements(node.body.statements);
    }
    super.visitModuleDeclaration(node);
  }

  private visitStatements(statements: ts.Statement[]) {
    this.chain(statements)
      .filter(chainedStatements => chainedStatements.prev.kind !== ts.SyntaxKind.Block)
      .forEach(unenclosedConsecutives => {
        const positions = this.endAndStartPositions(unenclosedConsecutives);
        if (this.areAdjacent(positions)) {
          this.raiseAdjacenceIssue(unenclosedConsecutives);
        } else if (this.haveSameIndentation(positions, unenclosedConsecutives)) {
          this.raiseBlockIssue(unenclosedConsecutives, this.countStatementsInTheSamePile(unenclosedConsecutives.prev, statements));
        } else if (this.areInlinedAndIndented(positions, unenclosedConsecutives)) {
          this.raiseInlinedAndIndentedIssue(unenclosedConsecutives);
        }
      });
  }

  private chain(statements: ts.Statement[]) : ChainedStatements[] {
    return statements
      .reduce((result, statement, i, array) => {
        if (i < array.length - 1) {
          if (this.isConditionOrLoop(statement)) {
            result.push({prev:statement, next:array[i + 1]})
          }
        }
        return result;
      }, new Array<{prev:ConditionOrLoop, next:ts.Statement}>())
      .map(pair => {return {topStatement: pair.prev, prev:this.extractLastBody(pair.prev), next:pair.next}})
  }

  private isConditionOrLoop(statement: ts.Statement): statement is ConditionOrLoop {
    return is(statement,ts.SyntaxKind.IfStatement, ts.SyntaxKind.ForStatement, ts.SyntaxKind.ForInStatement, ts.SyntaxKind.ForOfStatement, ts.SyntaxKind.WhileStatement);
  }

  private extractLastBody(statement: ConditionOrLoop): ts.Statement {
    if (statement.kind === ts.SyntaxKind.IfStatement) {
      if(!statement.elseStatement) {
        return statement.thenStatement;
      } else {
        return statement.elseStatement;
      }
    } else {
      return statement.statement;
    }
  }

  private endAndStartPositions(pair: {prev: ts.Statement, next: ts.Statement}) : Positions {
    return {
      prevStart : this.getLineAndCharacterOfPosition(pair.prev.getStart()),
      prevEnd : this.getLineAndCharacterOfPosition(pair.prev.getEnd()),
      nextStart : this.getLineAndCharacterOfPosition(pair.next.getStart()),
      nextEnd : this.getLineAndCharacterOfPosition(pair.next.getEnd())
    };
  }

  private areAdjacent(positions: Positions) : boolean {
    return positions.prevEnd.line === positions.nextStart.line;
  }

  private raiseAdjacenceIssue(adjacentStatements: ChainedStatements) {
    const conditional = adjacentStatements.topStatement.kind === ts.SyntaxKind.IfStatement;
    this.addFailureAtNode(
      adjacentStatements.next,
      `This statement will not be executed ${conditional ? "conditionally" : "in a loop"}; ` +
      `only the first statement will be. The rest will execute ${conditional ? "unconditionally" : "only once"}.`
    );
  }

  private haveSameIndentation(positions: Positions, chainedStatements: ChainedStatements) : boolean {
    return positions.prevStart.character === positions.nextStart.character && this.areMoreIndentedThanTopStatement(chainedStatements);
  }

  private areMoreIndentedThanTopStatement(chainedStatements: ChainedStatements) : boolean {
    const rootIndentation = this.getLineAndCharacterOfPosition(chainedStatements.topStatement.getStart()).character;
    const prevIndentation = this.getLineAndCharacterOfPosition(chainedStatements.prev.getStart()).character;
    return prevIndentation > rootIndentation;
  }

  private countStatementsInTheSamePile(reference: ts.Statement, statements: ts.Statement[]) : number {
    let startOfPile = this.getLineAndCharacterOfPosition(reference.getStart());
    let lastLineOfPile = startOfPile.line;
    for(let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const currentLine = this.getLineAndCharacterOfPosition(statement.getEnd()).line;
      const currentIndentation = this.getLineAndCharacterOfPosition(statement.getStart()).character;
      if (currentLine > startOfPile.line) {
        if (currentIndentation === startOfPile.character) {
          lastLineOfPile = this.getLineAndCharacterOfPosition(statement.getEnd()).line
        } else {
          break;
        }
      }
    }
    return  lastLineOfPile - startOfPile.line + 1;
  }

  private raiseBlockIssue(piledStatements: ChainedStatements, sizeOfPile: number) {
    const conditional = piledStatements.topStatement.kind === ts.SyntaxKind.IfStatement;
    this.addFailureAtNode(
      piledStatements.next,
      `This line will not be executed ${conditional ? "conditionally" : "in a loop"}; ` +
      `only the first line of this ${sizeOfPile}-line block will be. The rest will execute ${conditional ? "unconditionally" : "only once"}.`
    );
  }

  private areInlinedAndIndented(positions: Positions, chainedStatements: ChainedStatements) {
    const topStatementEnd = this.getLineAndCharacterOfPosition(chainedStatements.topStatement.getEnd());
    const topStatementStart = this.getLineAndCharacterOfPosition(chainedStatements.topStatement.getStart());
    return positions.prevStart.line === topStatementEnd.line && positions.nextStart.character > topStatementStart.character;
  }

  private raiseInlinedAndIndentedIssue(chainedStatements: ChainedStatements) {
    const conditional = chainedStatements.topStatement.kind === ts.SyntaxKind.IfStatement;
    this.addFailureAtNode(
      chainedStatements.next,
      `This line will not be executed ${conditional ? "conditionally" : "in a loop"}; ` +
      `only the first statement will be. The rest will execute ${conditional ? "unconditionally" : "only once"}.`
    );
  }
}

type ChainedStatements = {
  topStatement: ConditionOrLoop,
  prev: ts.Statement,
  next: ts.Statement
}

type Positions = {
  prevStart : ts.LineAndCharacter,
  prevEnd : ts.LineAndCharacter,
  nextStart : ts.LineAndCharacter,
  nextEnd : ts.LineAndCharacter
}

type ConditionOrLoop = ts.IfStatement | ts.ForStatement | ts.ForInStatement | ts.ForOfStatement | ts.WhileStatement;
