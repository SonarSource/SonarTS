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
    const current = this.createBlock();
    current.addSuccessor(this.end);
    const start = this.buildStatements(current, reversedStatements);

    const graph = new ControlFlowGraph();
    graph.addStart(start);
    graph.finalize();
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
        return this.buildExpression(this.createBranchingBlock(whenTrue, whenFalse), conditionalExpression.condition);
      }
      case SyntaxKind.BinaryExpression: {
        const binaryExpression = expression as ts.BinaryExpression;
        current.addElement(expression);
        if (binaryExpression.operatorToken.kind === SyntaxKind.EqualsToken) {
          const right = this.buildExpression(current, binaryExpression.right);
          return this.buildExpression(right, binaryExpression.left);
        }
      }
      case SyntaxKind.NumericLiteral:
      case SyntaxKind.StringLiteral:
      case SyntaxKind.Identifier:
        current.addElement(expression);
        return current;
      default:
        throw new Error("Unknown expression: " + SyntaxKind[expression.kind]);
    }
  }

  private createBlock(): CfgBlock {
    return new CfgBlock();
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
    collectBlocks(this.start, "1");
    return graphBlocks;

    function collectBlocks(block: CfgBlock, baseId: string) {
      if (graphBlocks.includes(block)) return;
      block.id = baseId;
      graphBlocks.push(block);
      block.getSuccessors().forEach((successor, i) => collectBlocks(successor, baseId + "," + (i + 1)));
    }
  }

  public finalize() {
    this.makeBidirectional();
    const end = this.findEnd();
    collapseEmpty(end);

    function collapseEmpty(block: CfgBlock) {
      if (block.getElements().length === 0 && block.getSuccessors().length === 1) {
        const successor = block.getSuccessors()[0];
        block.getPredecessors().forEach(predecessor => predecessor.replaceSuccessor(block, successor));
        successor.dropPredecessor(block);
      }
      block.getPredecessors().forEach(collapseEmpty);
    }
  }

  private makeBidirectional() {
    this.getBlocks().forEach(block => {
      block.getSuccessors().forEach(successor => successor.addPredecessor(block));
    });
  }

  private findEnd(): CfgEndBlock {
    return this.getBlocks().find(block => block.getSuccessors().length === 0) as CfgEndBlock;
  }

}

export class CfgBlock {
  public id: string;
  private elements: ts.Node[] = [];
  private successors: CfgBlock[] = [];
  private predecessors: CfgBlock[] = [];

  constructor() {
    this.id = "";
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

  public addPredecessor(predecessor: CfgBlock): void {
    this.predecessors.push(predecessor);
  }

  public getSuccessors(): CfgBlock[] {
    return this.successors;
  }

  public getPredecessors(): CfgBlock[] {
    return this.predecessors;
  }

  public replaceSuccessor(what: CfgBlock, withWhat: CfgBlock): void {
    const index = this.successors.indexOf(what);
    this.successors[index] = withWhat;
  }

  public dropPredecessor(block: CfgBlock): void {
    const index = this.predecessors.indexOf(block);
    this.predecessors.splice(index, 1);
  }

  public getLabel(): string {
    return this.id + "\n" + this.getElements().join("\n");
  }
}

export class CfgEndBlock extends CfgBlock {
  constructor() {
    super();
  }

  public getLabel(): string {
    return "END";
  }
}
