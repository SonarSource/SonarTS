import { flatten, uniqBy } from "lodash";
import * as ts from "typescript";
import { CfgBuilder } from "./builder";

const { SyntaxKind } = ts;

export class ControlFlowGraph {
  private start: CfgBlock;
  private blocks: CfgBlock[];

  constructor(blocks: CfgBlock[] = []) {
    this.blocks = blocks;
  }

  public static fromSource(statements: ts.NodeArray<ts.Statement>): ControlFlowGraph {
    return new CfgBuilder().build(statements);
  }

  public getBlocks(): CfgBlock[] {
    const graphBlocks: CfgBlock[] = [];
    collectBlocks(this.start, "1");
    return graphBlocks.concat(
      this.blocks.filter(block => !graphBlocks.includes(block))
      .map((block, idx) => { block.id = "dead " + idx; return block; }),
    );

    function collectBlocks(block: CfgBlock, baseId: string) {
      if (graphBlocks.includes(block)) return;
      block.id = baseId;
      graphBlocks.push(block);
      block.getSuccessors().forEach((successor, i) => collectBlocks(successor, baseId + "\." + (i + 1)));
    }
  }

  public addStart(start: CfgBlock) {
    this.start = start;
  }

  public finalize() {
    const blocks = this.blocks;
    this.makeBidirectional();
    const visited: CfgBlock[] = [];
    const end = this.findEnd();
    if (end) {
      collapseEmpty(end);
    } else {
      // We are in a loop, so we collapse arbitrarily from the start node
      collapseEmpty(this.start);
    }

    function collapseEmpty(block: CfgBlock) {
      if (visited.includes(block)) return;
      if (block.getElements().length === 0 && block.getSuccessors().length === 1) {
        const successor = block.getSuccessors()[0];
        block.getPredecessors().forEach(predecessor => predecessor.replaceSuccessor(block, successor));
        successor.dropPredecessor(block);
        blocks.splice(blocks.indexOf(block), 1);
      }
      visited.push(block);
      block.getPredecessors().forEach(collapseEmpty);
    }
  }

  private makeBidirectional() {
    this.getBlocks().forEach(block => {
      block.getSuccessors().forEach(successor => successor.addPredecessor(block));
    });
  }

  private findEnd(): CfgEndBlock | undefined {
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

  public addElement(element: ts.Node): CfgBlock {
    this.elements.unshift(element);
    return this;
  }

  public getElements(): string[] {
    return this.elements.map((element) => element.getText());
  }

  public addSuccessor(successor: CfgBlock): void {
    if (this.successors.includes(successor))
      throw new Error("CfgBlock " + this.getLabel() + " already contains " + successor.getLabel());
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
  public getLabel(): string {
    return "END";
  }
}

export class CfgBranchingBlock extends CfgBlock {
  private branchingLabel: string;
  private trueSuccessor: CfgBlock;
  private falseSuccessor: CfgBlock;

  constructor(branchingLabel: string, trueSuccessor: CfgBlock, falseSuccessor: CfgBlock) {
    super();
    this.branchingLabel = branchingLabel;
    this.trueSuccessor = trueSuccessor;
    this.falseSuccessor = falseSuccessor;
    this.addSuccessor(trueSuccessor);
    this.addSuccessor(falseSuccessor);
  }

  public getTrueSuccessor(): CfgBlock {
    return this.trueSuccessor;
  }

  public getFalseSuccessor(): CfgBlock {
    return this.falseSuccessor;
  }

  public getLabel(): string {
    return super.getLabel() + "\n" + "<" + this.branchingLabel + ">";
  }
}
