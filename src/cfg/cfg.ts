import { flatten } from "lodash";
import * as ts from "typescript";

const { SyntaxKind } = ts;

class CfgBuilder {

  private blockCounter = 0;

  public build(statements: ts.NodeArray<ts.Statement>): ControlFlowGraph {
    const endBlock = this.createBlock();
    statements.forEach(statement => {
      switch (statement.kind) {
        case SyntaxKind.ExpressionStatement:
          this.buildExpression(endBlock, (statement as ts.ExpressionStatement).expression);
          break;
        default:
          console.log("Unknown statement:", SyntaxKind[statement.kind]);
      }
    });
    const graph = new ControlFlowGraph();
    graph.addStart(endBlock);
    return graph;
  }

  private buildExpression(block: CfgBlock, expression: ts.Expression) {
    switch (expression.kind) {
      case SyntaxKind.CallExpression: {
        const callExpression = expression as ts.CallExpression;
        this.buildExpression(block, callExpression.expression);
        callExpression.arguments.forEach(arg => this.buildExpression(block, arg));
        block.addElement(expression);
        break;
      }
      case SyntaxKind.ConditionalExpression: {
        const conditionalExpression = expression as ts.ConditionalExpression;
        this.buildExpression(block, conditionalExpression.condition);
        this.createSuccessorBlock(block, conditionalExpression.whenTrue);
        this.createSuccessorBlock(block, conditionalExpression.whenFalse);
      }
      case SyntaxKind.Identifier:
        block.addElement(expression);
        break;
      default:
        console.log("Unknown expression:", SyntaxKind[expression.kind]);
    }
  }

  private createBlock(): CfgBlock {
    const block = new CfgBlock(this.blockCounter);
    this.blockCounter++;
    return block;
  }

  private createSuccessorBlock(predecessor: CfgBlock, expression: ts.Expression) {
    const successor = this.createBlock();
    this.buildExpression(successor, expression);
    predecessor.addSuccessor(successor);
    return successor;
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
    return [this.start, ...this.takeChildren(this.start)];
  }

  private takeChildren(block: CfgBlock): CfgBlock[] {
    const successors = block.getSuccessors();
    return [
      ...successors,
      ...flatten(successors.map(successor => this.takeChildren(successor))),
    ];
  }
}

export class CfgBlock {
  public id: number;
  private elements: ts.Node[] = [];
  private successors: CfgBlock[] = [];

  constructor(id: number) {
    this.id = id;
  }

  public addElement(element: ts.Expression): void {
    this.elements.push(element);
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
}
