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
  private startBlock: CfgBlock;
  public readonly end: CfgEndBlock;
  private readonly blocks: CfgBlock[];

  get start() {
    return this.startBlock;
  }

  constructor(start: CfgBlock, end: CfgEndBlock, blocks: CfgBlock[] = []) {
    this.startBlock = start;
    this.end = end;
    this.blocks = blocks;
    this.finalize();
  }

  private finalize() {
    this.makeBidirectional();
    this.collapseEmpty();
    this.makeBidirectional();
  }

  public static fromStatements(statements: ts.NodeArray<ts.Statement>): ControlFlowGraph | undefined {
    return new CfgBuilder().build(statements);
  }

  public getBlocks(): CfgBlock[] {
    return this.blocks;
  }

  public findLoopingBlock(loopNode: ts.Node): CfgBlock | undefined {
    return this.blocks.find(block => block.loopingStatement === loopNode);
  }

  private collapseEmpty() {
    const originalBlocks = [...this.blocks];
    for (const block of originalBlocks) {
      if (block.getElements().length === 0 && block.getSuccessors().length === 1) {
        const successor = block.getSuccessors()[0];
        this.blocks.splice(this.blocks.indexOf(block), 1);
        if (block.loopingStatement) {
          if (!successor.loopingStatement) {
            successor.loopingStatement = block.loopingStatement;
          } else {
            throw new Error(
              `CFG inconsistency : both empty block "${block.getLabel()}" and successor "${successor.getLabel()}" have loopingStatement`,
            );
          }
        }
        if (block instanceof CfgBlockWithPredecessors) {
          block.predecessors.forEach(predecessor => {
            predecessor.replaceSuccessor(block, successor);
            successor.replacePredecessor(block, predecessor);
          });
        }
        if (block === this.start) {
          this.startBlock = successor;
        }
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
}

export interface CfgBlock {
  loopingStatement: ts.IterationStatement | undefined;

  addElement(element: ts.Node): void;

  getElements(): ts.Node[];

  getSuccessors(): CfgBlock[];

  replaceSuccessor(what: CfgBlock, withWhat: CfgBlock): void;

  replacePredecessor(what: CfgBlock, withWhat: CfgBlock): void;

  getLabel(): string;
}

export abstract class CfgBlockWithPredecessors {
  public predecessors: CfgBlock[] = [];
  public loopingStatement: ts.IterationStatement | undefined;

  public replacePredecessor(what: CfgBlock, withWhat: CfgBlock): void {
    const index = this.predecessors.indexOf(what);
    this.predecessors[index] = withWhat;
  }
}

export abstract class CfgBlockWithElements extends CfgBlockWithPredecessors {
  private elements: ts.Node[] = [];

  public addElement(element: ts.Node) {
    this.elements.unshift(element);
  }

  public getElements(): ts.Node[] {
    return this.elements;
  }

  public getLabel(): string {
    return this.getElements()
      .map(element => element.getText())
      .join("\n");
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

  public getElements(): ts.Node[] {
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
