import * as ts from "typescript";

class CfgBuilder {

  private currentBlock: CfgBlock;
  private blocks: CfgBlock[] = [];
  private blockCounter = 0;

  public build(statements: ts.NodeArray<ts.Statement>): ControlFlowGraph {
    const endBlock = this.createBlock();
    this.blocks.push(endBlock);
    const graph = new ControlFlowGraph();
    graph.addBlock(endBlock);
    return graph;
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

  public getElements(): ts.Node[] {
    return this.elements;
  }

  public addSuccessor(successor: CfgBlock): void {
    this.successors.push(successor);
  }

  public getSuccessors(): CfgBlock[] {
    return this.successors;
  }
}
