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
import * as ts from "typescript";
import { CfgBuilder } from "./builder";

export class ControlFlowGraph {
  private start: CfgBlock;
  private blocks: CfgBlock[];

  constructor(blocks: CfgBlock[] = []) {
    this.blocks = blocks;
  }

  public static fromStatements(statements: ts.NodeArray<ts.Statement>): ControlFlowGraph {
    return new CfgBuilder().build(statements);
  }

  public getBlocks(): CfgBlock[] {
    const graphBlocks: CfgBlock[] = [];
    collectBlocks(this.start, "1");
    return graphBlocks.concat(
      this.blocks.filter(block => !graphBlocks.includes(block)).map((block, idx) => {
        block.id = "dead " + idx;
        return block;
      }),
    );

    function collectBlocks(block: CfgBlock, baseId: string) {
      if (graphBlocks.includes(block)) return;
      block.id = baseId;
      graphBlocks.push(block);
      block.getSuccessors().forEach((successor, i) => collectBlocks(successor, baseId + "." + (i + 1)));
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
    this.makeBidirectional();

    function collapseEmpty(block: CfgBlock) {
      if (visited.includes(block)) return;
      visited.push(block);
      if (block.getElements().length === 0 && block.getSuccessors().length === 1) {
        const successor = block.getSuccessors()[0];
        blocks.splice(blocks.indexOf(block), 1);
        if (block instanceof CfgBlockWithPredecessors) {
          block.predecessors.forEach(predecessor => predecessor.replaceSuccessor(block, successor));
        }
      }
      if (block instanceof CfgBlockWithPredecessors) {
        block.predecessors.forEach(collapseEmpty);
      }
    }
  }

  private makeBidirectional() {
    this.getBlocks().forEach(block => {
      if (block instanceof CfgBlockWithPredecessors) {
        block.predecessors = [];
      }
    });
    this.getBlocks().forEach(block => {
      block.getSuccessors().forEach(successor => {
        if (successor instanceof CfgBlockWithPredecessors) {
          successor.predecessors.push(block);
        }
      });
    });
  }

  private findEnd(): CfgEndBlock | undefined {
    return this.getBlocks().find(block => block.getSuccessors().length === 0) as CfgEndBlock;
  }
}

export interface CfgBlock {
  id: string;

  addElement(element: ts.Node): void;

  getElements(): string[];

  getSuccessors(): CfgBlock[];

  replaceSuccessor(what: CfgBlock, withWhat: CfgBlock): void;

  getLabel(): string;
}

export abstract class CfgBlockWithPredecessors {
  public id: string = "";
  public predecessors: CfgBlock[] = [];
}

export abstract class CfgBlockWithElements extends CfgBlockWithPredecessors {
  private elements: ts.Node[] = [];

  public addElement(element: ts.Node) {
    this.elements.unshift(element);
  }

  public getElements(): string[] {
    return this.elements.map(element => element.getText());
  }

  public getLabel(): string {
    return this.getElements().join("\n");
  }
}

export class CfgGenericBlock extends CfgBlockWithElements implements CfgBlock {
  private successors: CfgBlock[] = [];

  public addSuccessor(successor: CfgBlock): void {
    this.successors.push(successor);
  }

  public getSuccessors(): CfgBlock[] {
    return this.successors;
  }

  public replaceSuccessor(what: CfgBlock, withWhat: CfgBlock): void {
    const index = this.successors.indexOf(what);
    this.successors[index] = withWhat;
  }
}

export class CfgEndBlock extends CfgBlockWithPredecessors implements CfgBlock {
  public addElement(_: ts.Node): CfgBlock {
    return this;
  }

  public getElements(): string[] {
    return [];
  }

  public addSuccessor(_: CfgBlock): void {
    return;
  }

  public getSuccessors(): CfgBlock[] {
    return [];
  }

  public replaceSuccessor(_: CfgBlock, __: CfgBlock): void {
    return;
  }

  public getLabel(): string {
    return "END";
  }
}

export class CfgBranchingBlock extends CfgBlockWithElements implements CfgBlock {
  private branchingLabel: string;
  private trueSuccessor: CfgBlock;
  private falseSuccessor: CfgBlock;

  constructor(branchingLabel: string, trueSuccessor: CfgBlock, falseSuccessor: CfgBlock) {
    super();
    this.branchingLabel = branchingLabel;
    this.trueSuccessor = trueSuccessor;
    this.falseSuccessor = falseSuccessor;
  }

  public getTrueSuccessor(): CfgBlock {
    return this.trueSuccessor;
  }

  public getFalseSuccessor(): CfgBlock {
    return this.falseSuccessor;
  }

  public replaceSuccessor(what: CfgBlock, withWhat: CfgBlock): void {
    if (this.trueSuccessor === what) {
      this.trueSuccessor = withWhat;
    }
    if (this.falseSuccessor === what) {
      this.falseSuccessor = withWhat;
    }
  }

  public getLabel(): string {
    return super.getLabel() + "\n" + "<" + this.branchingLabel + ">";
  }

  public getSuccessors(): CfgBlock[] {
    return [this.trueSuccessor, this.falseSuccessor];
  }
}
