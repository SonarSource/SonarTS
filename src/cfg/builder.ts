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
import { flatten, uniqBy } from "lodash";
import * as ts from "typescript";
import { CfgBlock, CfgBranchingBlock, CfgEndBlock, CfgGenericBlock, ControlFlowGraph } from "./cfg";

const { SyntaxKind } = ts;

export class CfgBuilder {

  private end = new CfgEndBlock();
  private blocks: CfgBlock[] = [this.end];

  public build(statements: ts.NodeArray<ts.Statement>): ControlFlowGraph {
    const current = this.createBlock();
    current.addSuccessor(this.end);
    const start = this.buildStatements(current, statements);

    const graph = new ControlFlowGraph(this.blocks);
    graph.addStart(start);
    graph.finalize();
    start.addElement(({ getText() { return "START"; } } as ts.Expression));
    return graph;
  }

  private buildStatements(current: CfgBlock, topDownStatements: ts.Statement[]): CfgBlock {
    const statements = [...topDownStatements].reverse();

    statements.forEach(statement => {
      switch (statement.kind) {
        case SyntaxKind.Block:
          const block = statement as ts.Block;
          current = this.buildStatements(current, block.statements);
          break;
        case SyntaxKind.ExpressionStatement:
          current = this.buildExpression(current, (statement as ts.ExpressionStatement).expression);
          break;
        case SyntaxKind.IfStatement: {
          const ifStatement = statement as ts.IfStatement;
          let whenFalse = current;
          if (ifStatement.elseStatement) {
            whenFalse = this.buildStatements(this.createPredecessorBlock(current), [ifStatement.elseStatement]);
          }
          const whenTrue = this.buildStatements(this.createPredecessorBlock(current), [ifStatement.thenStatement]);
          current = this.buildExpression(
            this.createBranchingBlock("if (" + ifStatement.expression.getText() + ")", whenTrue, whenFalse),
            ifStatement.expression,
          );
          break;
        }
        case SyntaxKind.ForStatement: {
          const forLoop = statement as ts.ForStatement;
          const loopBottom = this.createBlock();
          let lastBlockInLoopStatement: CfgBlock = loopBottom;
          if (forLoop.incrementor) {
            lastBlockInLoopStatement = this.buildExpression(lastBlockInLoopStatement, forLoop.incrementor);
          }
          const firstBlockInLoopStatement = this.buildStatements(lastBlockInLoopStatement, [forLoop.statement]);
          let loopRoot: CfgBlock;
          if (forLoop.condition) {
            loopRoot = this.buildExpression(
              new CfgBranchingBlock(this.forLoopLabel(forLoop), firstBlockInLoopStatement, current), forLoop.condition);
          } else {
            loopRoot = this.createPredecessorBlock(firstBlockInLoopStatement);
          }
          let loopStart = loopRoot;
          if (forLoop.initializer) {
            loopStart = this.buildForInitializer(this.createPredecessorBlock(loopRoot), forLoop.initializer);
          }
          loopBottom.addSuccessor(loopRoot);
          current = loopStart;
          break;
        }
        case SyntaxKind.WhileStatement: {
          const whileLoop = statement as ts.WhileStatement;
          const loopBottom = this.createBlock();
          const firstLoopStatementBlock = this.buildStatements(loopBottom, [whileLoop.statement]);
          const loopStart = this.buildExpression(
            new CfgBranchingBlock("while(" + whileLoop.expression.getText() + ")", firstLoopStatementBlock, current),
            whileLoop.expression,
          );
          loopBottom.addSuccessor(loopStart);
          current = loopStart;
          break;
        }
        case SyntaxKind.DoStatement: {
          const doWhileLoop = statement as ts.DoStatement;
          const doBlockEnd = this.createBlock();
          const doBlockStart = this.buildStatements(doBlockEnd, [doWhileLoop.statement]);
          const whileBlockEnd = new CfgBranchingBlock(
            "while(" + doWhileLoop.expression.getText() + ")",
            doBlockStart,
            current,
          );
          const whileStartBlock = this.buildExpression(whileBlockEnd, doWhileLoop.expression);
          doBlockEnd.addSuccessor(whileStartBlock);
          current = doBlockStart;
          break;
        }
        case SyntaxKind.SwitchStatement: {
          const switchStatement = statement as ts.SwitchStatement;
          const clauses = [...switchStatement.caseBlock.clauses].reverse();
          const clausesBlocks = clauses.map(clause => {
            current = this.buildStatements(this.createPredecessorBlock(current), clause.statements);
            return current;
          });
          const switchEndBlock = this.createBlock();
          clausesBlocks.forEach(clauseBlock => switchEndBlock.addSuccessor(clauseBlock));
          current = this.buildExpression(switchEndBlock, switchStatement.expression);
          break;
        }
        case SyntaxKind.ReturnStatement: {
          const returnStatement = statement as ts.ReturnStatement;
          if (returnStatement.expression) {
            current = this.buildExpression(this.createPredecessorBlock(this.end), returnStatement.expression);
          } else {
            current = this.createPredecessorBlock(this.end);
          }
          break;
        }
        case SyntaxKind.EmptyStatement:
          break;
        // Just add declaration statement as element to the current cfg block. Do not enter inside.
        case SyntaxKind.DebuggerStatement:
        case SyntaxKind.ImportDeclaration:
        case SyntaxKind.MissingDeclaration:
        case SyntaxKind.ClassDeclaration:
        case SyntaxKind.FunctionDeclaration:
        case SyntaxKind.EnumDeclaration:
        case SyntaxKind.ModuleDeclaration:
        case SyntaxKind.NamespaceExportDeclaration:
        case SyntaxKind.ImportEqualsDeclaration:
        case SyntaxKind.ExportDeclaration:
        case SyntaxKind.ExportAssignment:
        case SyntaxKind.TypeAliasDeclaration:
        case SyntaxKind.InterfaceDeclaration:
        case SyntaxKind.ModuleBlock:
          current.addElement(statement);
          break;
        case SyntaxKind.VariableStatement:
          current = this.buildVariableDeclarationList(current, (statement as ts.VariableStatement).declarationList);
          break;
        case SyntaxKind.ForInStatement:
        case SyntaxKind.ForOfStatement:
          throw new Error("Not yet implemented statement: " + SyntaxKind[statement.kind]);

        case SyntaxKind.ContinueStatement:
        case SyntaxKind.BreakStatement:
        case SyntaxKind.WithStatement:
        case SyntaxKind.LabeledStatement:
        case SyntaxKind.ThrowStatement:
        case SyntaxKind.TryStatement:
        case SyntaxKind.NotEmittedStatement:
          throw new Error("Statement out of current CFG implementation scope " + + SyntaxKind[statement.kind]);

        default:
          throw new Error("Unknown statement: " + SyntaxKind[statement.kind]);
      }
    });

    return current;
  }

  private buildForInitializer(current: CfgBlock, forInitializer: ts.Expression | ts.VariableDeclarationList): CfgBlock {
    return forInitializer.kind === ts.SyntaxKind.VariableDeclarationList
      ? this.buildVariableDeclarationList(current, forInitializer as ts.VariableDeclarationList)
      : this.buildExpression(current, forInitializer);
  }

  private buildVariableDeclarationList(current: CfgBlock, variableDeclarations: ts.VariableDeclarationList): CfgBlock {
    variableDeclarations.declarations.reverse().forEach((variableDeclaration) => {
      current = this.buildBindingName(current, variableDeclaration.name);
      if (variableDeclaration.initializer) {
        current = this.buildExpression(current, variableDeclaration.initializer);
      }
    });

    return current;
  }

  private buildBindingName(current: CfgBlock, bindingName: ts.BindingName): CfgBlock {
    const buildElements = (elements: ts.NodeArray<ts.BindingElement | ts.OmittedExpression>) => {
      elements
        .reverse()
        .forEach(element => (current = this.buildBindingElement(current, element)));
    };

    switch (bindingName.kind) {
      case ts.SyntaxKind.Identifier:
        current = this.buildExpression(current, bindingName);
        break;
      case ts.SyntaxKind.ObjectBindingPattern:
        const objectBindingPattern = bindingName as ts.ObjectBindingPattern;
        buildElements(objectBindingPattern.elements);
        break;
      case ts.SyntaxKind.ArrayBindingPattern:
        const arrayBindingPattern = bindingName as ts.ArrayBindingPattern;
        buildElements(arrayBindingPattern.elements);
        break;
    }
    return current;
  }

  private buildBindingElement(current: CfgBlock, bindingElement: ts.BindingElement | ts.OmittedExpression): CfgBlock {
    if (bindingElement.kind !== ts.SyntaxKind.OmittedExpression) {
      current = this.buildBindingName(current, bindingElement.name);

      if (bindingElement.initializer) {
        current = this.buildExpression(current, bindingElement.initializer);
      }
    }
    return current;
  }

  private buildExpression(current: CfgBlock, expression: ts.Expression): CfgBlock {
    switch (expression.kind) {
      case SyntaxKind.CallExpression: {
        current.addElement(expression);
        const callExpression = expression as ts.CallExpression;

        [...callExpression.arguments].reverse().forEach(arg => {
          current = this.buildExpression(current, arg);
        });
        current = this.buildExpression(current, callExpression.expression);

        return current;
      }
      case SyntaxKind.ConditionalExpression: {
        const conditionalExpression = expression as ts.ConditionalExpression;
        const whenFalse = this.buildExpression(this.createPredecessorBlock(current), conditionalExpression.whenFalse);
        const whenTrue = this.buildExpression(this.createPredecessorBlock(current), conditionalExpression.whenTrue);
        return this.buildExpression(
          new CfgBranchingBlock(expression.getText(), whenTrue, whenFalse), conditionalExpression.condition,
        );
      }
      case SyntaxKind.BinaryExpression: {
        const binaryExpression = expression as ts.BinaryExpression;
        return this.buildBinaryExpression(current, binaryExpression);
      }
      case SyntaxKind.ParenthesizedExpression: {
        const parenthesizedExpression = expression as ts.ParenthesizedExpression;
        return this.buildExpression(current, parenthesizedExpression.expression);
      }
      case SyntaxKind.TrueKeyword:
      case SyntaxKind.FalseKeyword:
      case SyntaxKind.NumericLiteral:
      case SyntaxKind.StringLiteral:
      case SyntaxKind.Identifier:
        current.addElement(expression);
        return current;
      default:
        throw new Error("Unknown expression: " + SyntaxKind[expression.kind]);
    }
  }

  private buildBinaryExpression(current: CfgBlock, expression: ts.BinaryExpression): CfgBlock {
    switch (expression.operatorToken.kind) {
      case SyntaxKind.AmpersandAmpersandToken: {
        let whenFalse = current;
        let whenTrue = current;
        if (current instanceof CfgBranchingBlock && current.getElements().length === 0) {
          whenFalse = current.getFalseSuccessor();
        } else {
          whenTrue = this.createPredecessorBlock(current);
        }
        whenTrue = this.buildExpression(whenTrue, expression.right);
        const branching = new CfgBranchingBlock(expression.left.getText(), whenTrue, whenFalse);
        return this.buildExpression(branching, expression.left);
      }
      case SyntaxKind.BarBarToken: {
        let whenFalse = current;
        let whenTrue = current;
        if (current instanceof CfgBranchingBlock && current.getElements().length === 0) {
          whenTrue = current.getTrueSuccessor();
        } else {
          whenFalse = this.createPredecessorBlock(current);
        }
        whenFalse = this.buildExpression(whenFalse, expression.right);
        const branching = new CfgBranchingBlock(expression.left.getText(), whenTrue, whenFalse);
        return this.buildExpression(branching, expression.left);
      }
      case SyntaxKind.ExclamationEqualsEqualsToken:
      case SyntaxKind.EqualsEqualsEqualsToken:
      case SyntaxKind.ExclamationEqualsToken:
      case SyntaxKind.EqualsEqualsToken:
      case SyntaxKind.GreaterThanEqualsToken:
      case SyntaxKind.GreaterThanToken:
      case SyntaxKind.LessThanEqualsToken:
      case SyntaxKind.LessThanToken:
      case SyntaxKind.EqualsToken:
        current.addElement(expression);
        return this.buildExpression(this.buildExpression(current, expression.right), expression.left);
      default:
        throw new Error("Unknown binary token: " + SyntaxKind[expression.operatorToken.kind]);
    }
  }

  private createBranchingBlock(branchingLabel: string, trueSuccessor: CfgBlock, falseSuccessor: CfgBlock): CfgBranchingBlock {
    const block = new CfgBranchingBlock(branchingLabel, trueSuccessor, falseSuccessor);
    this.blocks.push(block);
    return block;
  }

  private createBlock(): CfgGenericBlock {
    const block = new CfgGenericBlock();
    this.blocks.push(block);
    return block;
  }

  private createPredecessorBlock(successor: CfgBlock) {
    const predecessor = this.createBlock();
    predecessor.addSuccessor(successor);
    return predecessor;
  }

  private forLoopLabel(forLoop: ts.ForStatement) {
    return "for(" +
      textOrEmpty(forLoop.initializer) +
      "\;" + textOrEmpty(forLoop.condition) +
      "\;" + textOrEmpty(forLoop.incrementor) +
      ")";

    function textOrEmpty(node?: ts.Node): string {
      if (node) return node.getText();
      return "";
    }
  }
}
