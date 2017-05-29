import { flatten, uniqBy } from "lodash";
import * as ts from "typescript";
import { CfgBlock, CfgBranchingBlock, CfgEndBlock, ControlFlowGraph } from "./cfg";

const { SyntaxKind } = ts;

export class CfgBuilder {

  private blockCounter = 0;
  private end = new CfgEndBlock();

  public build(statements: ts.NodeArray<ts.Statement>): ControlFlowGraph {
    const current = this.createBlock();
    current.addSuccessor(this.end);
    const start = this.buildStatements(current, statements);

    const graph = new ControlFlowGraph();
    graph.addStart(start);
    graph.finalize();
    start.addElement(({ getText() { return "START"; } } as ts.Expression));
    return graph;
  }

  private buildStatements(currentBlock: CfgBlock, topDownStatements: ts.Statement[]): CfgBlock {
    let current = currentBlock;
    const statements = [...topDownStatements].reverse();

    statements.forEach(statement => {
      switch (statement.kind) {
        case SyntaxKind.Block: {
          const block = statement as ts.Block;
          current = this.buildStatements(current, block.statements);
          break;
        }
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
            new CfgBranchingBlock("if (" + ifStatement.expression.getText() + ")", whenTrue, whenFalse),
            ifStatement.expression,
          );
          break;
        }
        case SyntaxKind.ForStatement: {
          const forLoop = statement as ts.ForStatement;
          const loopBottom = new CfgBlock();
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
          const loopBottom = new CfgBlock();
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
          const doBlockEnd = new CfgBlock();
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
          const switchEndBlock = new CfgBlock();
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
        let newCurrent = current;
        [...callExpression.arguments].reverse().forEach(arg => {
          newCurrent = this.buildExpression(newCurrent, arg);
        });
        newCurrent = this.buildExpression(newCurrent, callExpression.expression);

        return newCurrent;
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
      case SyntaxKind.EqualsToken: {
        const right = this.buildExpression(current, expression.right);
        return this.buildExpression(right, expression.left);
      }
      case SyntaxKind.AmpersandAmpersandToken: {
        const whenTrue = this.buildExpression(current, expression.right);
        let whenFalse = current;
        if (current instanceof CfgBranchingBlock) {
          whenFalse = current.getFalseSuccessor();
        }
        const branching = new CfgBranchingBlock(expression.left.getText(), whenTrue, whenFalse);
        return this.buildExpression(branching, expression.left);
      }
      default:
        throw new Error("Unknown binary token: " + SyntaxKind[expression.operatorToken.kind]);
    }
  }

  private createBlock(): CfgBlock {
    return new CfgBlock();
  }

  private createPredecessorBlock(successor: CfgBlock) {
    const predecessor = new CfgBlock();
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
