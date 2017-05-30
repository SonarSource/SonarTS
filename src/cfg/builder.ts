import { flatten, uniqBy } from "lodash";
import * as ts from "typescript";
import { CfgBlock, CfgBranchingBlock, CfgEndBlock, ControlFlowGraph } from "./cfg";

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
          let whenFalse;
          if (ifStatement.elseStatement) {
            whenFalse = this.buildStatements(this.createPredecessorBlock(current), [ifStatement.elseStatement]);
          } else {
            whenFalse = current;
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
          let lastBlockInLoopStatement = loopBottom;
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
            loopStart = this.buildExpression(this.createPredecessorBlock(loopRoot), forLoop.initializer);
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

        case SyntaxKind.ContinueStatement:
        case SyntaxKind.BreakStatement:
        case SyntaxKind.WithStatement:
        case SyntaxKind.LabeledStatement:
        case SyntaxKind.ThrowStatement:
        case SyntaxKind.TryStatement:
        case SyntaxKind.NotEmittedStatement:
          throw new Error("Statement out of current CFG implementation scope " + + SyntaxKind[statement.kind]);

        case SyntaxKind.EmptyStatement:
        case SyntaxKind.DebuggerStatement:
        case SyntaxKind.VariableStatement:
        case SyntaxKind.ForInStatement:
        case SyntaxKind.ForOfStatement:
        case SyntaxKind.ImportDeclaration:
        case SyntaxKind.ModuleBlock:
        case SyntaxKind.MissingDeclaration:
        case SyntaxKind.FunctionDeclaration:
        case SyntaxKind.ClassDeclaration:
        case SyntaxKind.InterfaceDeclaration:
        case SyntaxKind.TypeAliasDeclaration:
        case SyntaxKind.EnumDeclaration:
        case SyntaxKind.ModuleDeclaration:
        case SyntaxKind.ImportEqualsDeclaration:
        case SyntaxKind.NamespaceExportDeclaration:
        case SyntaxKind.ExportDeclaration:
        case SyntaxKind.ExportAssignment:
          throw new Error("Not yet implemented statement: " + SyntaxKind[statement.kind]);

        default:
          throw new Error("Unknown statement: " + SyntaxKind[statement.kind]);
      }
    });

    return current;
  }

  private buildExpression(current: CfgBlock, expression: ts.Expression | ts.VariableDeclarationList): CfgBlock {
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
        current.addElement(expression);
        return this.buildBinaryExpression(current, binaryExpression);
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
        const whenTrue = this.buildExpression(current, expression.right);
        let whenFalse = current;
        if (current instanceof CfgBranchingBlock) {
          whenFalse = current.getFalseSuccessor();
        }
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
        return this.buildExpression(this.buildExpression(current, expression.right), expression.left);
      default:
        throw new Error("Unknown binary token: " + SyntaxKind[expression.operatorToken.kind]);
    }
  }

  private createBranchingBlock(
      branchingLabel: string, trueSuccessor: CfgBlock, falseSuccessor: CfgBlock,
    ): CfgBranchingBlock {
    const block = new CfgBranchingBlock(branchingLabel, trueSuccessor, falseSuccessor);
    this.blocks.push(block);
    return block;
  }

  private createBlock(): CfgBlock {
    const block = new CfgBlock();
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
