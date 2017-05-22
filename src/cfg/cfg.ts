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
    graph.addBlock(endBlock);
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

}

export class ControlFlowGraph {
  private blocks: CfgBlock[] = [];
  private startBlock: CfgBlock;
  private endBlock: CfgBlock;

  public static fromSource(statements: ts.NodeArray<ts.Statement>): ControlFlowGraph {
    return new CfgBuilder().build(statements);
  }

  public addBlock(block: CfgBlock) {
    this.blocks.push(block);
  }

  public getBlocks(): CfgBlock[] {
    return this.blocks;
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
