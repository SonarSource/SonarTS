import { flatten, uniqBy } from "lodash";
import * as ts from "typescript";

const { SyntaxKind } = ts;

// create end
// create current
// throwTargets.push(end)?
// build:
//   - reverse list of statements
//   -
// ...
// start = current block
// removeEmptyBlocks?
// add end

class CfgBuilder {

  private blockCounter = 0;
  private end = new CfgEndBlock();

  public build(statements: ts.NodeArray<ts.Statement>): ControlFlowGraph {
    const reversedStatements = [...statements].reverse();
    const start = this.buildStatements(this.end, reversedStatements);

    const graph = new ControlFlowGraph();
    graph.addStart(start);
    start.addElement(({ getText() { return "START"; } } as ts.Expression));
    return graph;
  }

  private buildStatements(current: CfgBlock, statements: ts.Statement[]): CfgBlock {
    let next = current;

    statements.forEach(statement => {
      switch (statement.kind) {
        case SyntaxKind.ExpressionStatement:
          next = this.buildExpression(next, (statement as ts.ExpressionStatement).expression);
          break;
        default:
          throw new Error("Unknown statement: " + SyntaxKind[statement.kind]);
      }
    });

    return next;
  }

  private buildExpression(current: CfgBlock, expression: ts.Expression): CfgBlock {
    switch (expression.kind) {
      case SyntaxKind.CallExpression: {
        const callExpression = expression as ts.CallExpression;
        let newCurrent = this.addElementToBlock(expression, current);
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
        return this.buildExpression(this.createBranchingBlock(whenTrue, whenFalse), conditionalExpression.condition);
      }
      case SyntaxKind.BinaryExpression: {
        const binaryExpression = expression as ts.BinaryExpression;
        const newCurrent = this.addElementToBlock(expression, current);
        if (binaryExpression.operatorToken.kind === SyntaxKind.EqualsToken) {
          const right = this.buildExpression(newCurrent, binaryExpression.right);
          return this.buildExpression(right, binaryExpression.left);
        }
      }
      case SyntaxKind.NumericLiteral:
      case SyntaxKind.StringLiteral:
      case SyntaxKind.Identifier:
        return this.addElementToBlock(expression, current);
      default:
        throw new Error("Unknown expression: " + SyntaxKind[expression.kind]);
    }
  }

  private createBlock(): CfgBlock {
    const block = new CfgBlock(this.blockCounter);
    this.blockCounter++;
    return block;
  }

  private createPredecessorBlock(successor: CfgBlock) {
    const predecessor = this.createBlock();
    predecessor.addSuccessor(successor);
    return predecessor;
  }

  private createBranchingBlock(whenTrue: CfgBlock, whenFalse: CfgBlock) {
    const branching = this.createBlock();
    branching.addSuccessor(whenTrue);
    branching.addSuccessor(whenFalse);
    return branching;
  }

  private addElementToBlock(element: ts.Expression, block: CfgBlock) {
    if (block instanceof CfgEndBlock) {
      const next = this.createPredecessorBlock(block);
      next.addElement(element);
      return next;
    } else {
      block.addElement(element);
      return block;
    }
  }

}

export class ControlFlowGraph {
  private start: CfgBlock;

  public static fromSource(statements: ts.NodeArray<ts.Statement>): ControlFlowGraph {
    return new CfgBuilder().build(statements);
  }

  public addStart(start: CfgBlock) {
    this.start = start;
  }

  public getBlocks(): CfgBlock[] {
    const graphBlocks: CfgBlock[] = [];
    collectBlocks(this.start);
    return graphBlocks;

    function collectBlocks(block: CfgBlock) {
      if (graphBlocks.includes(block)) return;
      graphBlocks.push(block);
      block.getSuccessors().forEach(successor => collectBlocks(successor));
    }
  }

}

export class CfgBlock {
  public id: number;
  private elements: ts.Node[] = [];
  private successors: CfgBlock[] = [];

  constructor(id: number) {
    this.id = id;
  }

  public addElement(element: ts.Expression): CfgBlock {
    this.elements.unshift(element);
    return this;
  }

  public getElements(): string[] {
    return this.elements.map((element) => element.getText());
  }

  public addSuccessor(successor: CfgBlock): void {
    this.successors.push(successor);
  }

  public getSuccessors(): CfgBlock[] {
    return this.successors;
  }

  public getLabel(): string {
    return this.id + "\n" + this.getElements().join("\n");
  }
}

export class CfgEndBlock extends CfgBlock {
  constructor() {
    super(-1);
  }

  public getLabel(): string {
    return "END";
  }
}
