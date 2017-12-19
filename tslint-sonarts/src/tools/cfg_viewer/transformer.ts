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
import { DataSet } from "vis";
import { CfgBlock, CfgBranchingBlock, ControlFlowGraph } from "../../cfg/cfg";

export interface VisData {
  nodes: DataSet<any>;
  edges?: DataSet<any>;
}

export default function toVisData(cfg: ControlFlowGraph): VisData {
  const viewerNodes: any[] = [];
  const viewerEdges: any[] = [];
  let edgeCounter = 0;
  const blocks = cfg.getBlocks();

  blocks.forEach(block => {
    viewerNodes.push({ id: blocks.indexOf(block), label: enrichLabelIfStart(block), physics: false });

    if (block instanceof CfgBranchingBlock) {
      viewerEdges.push(createEdge(block, block.getTrueSuccessor(), "true"));
      const falseSuccessor = block.getFalseSuccessor();
      if (falseSuccessor) viewerEdges.push(createEdge(block, falseSuccessor, "false"));
    } else {
      block.getSuccessors().forEach(successorBlock => {
        viewerEdges.push(createEdge(block, successorBlock));
      });
    }
  });

  if (viewerEdges.length > 0) {
    return { nodes: new DataSet(viewerNodes), edges: new DataSet(viewerEdges) };
  } else {
    return { nodes: new DataSet(viewerNodes) };
  }

  function createEdge(start: CfgBlock, end: CfgBlock, label?: string) {
    if (label) {
      return { id: edgeCounter++, from: blocks.indexOf(start), to: blocks.indexOf(end), arrows: "to", label };
    } else {
      return { id: edgeCounter++, from: blocks.indexOf(start), to: blocks.indexOf(end), arrows: "to" };
    }
  }

  function enrichLabelIfStart(block: CfgBlock) {
    let label = block.getLabel();
    if (block === cfg.start) {
      if (label === "") {
        label = "START";
      } else {
        label = "START\n" + label;
      }
    }
    return label;
  }
}
