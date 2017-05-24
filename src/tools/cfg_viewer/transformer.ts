import * as ts from "typescript";
import { DataSet } from "vis";
import { CfgBlock, CfgBranchingBlock, ControlFlowGraph } from "../../cfg/cfg";

export interface VisData {
  nodes: DataSet<any>;
  edges?: DataSet<any>;
}

export default function toVisData(cfg: ControlFlowGraph): VisData {
  const viewerNodes: any[] = [];
  const viewerEdges: any[] = [];

  cfg.getBlocks().forEach((block) => {
    viewerNodes.push({ id: block.id, label: block.getLabel(), physics: false });

    if (block instanceof CfgBranchingBlock) {
      viewerEdges.push(createEdge(block, block.getTrueSuccessor(), "true"));
      const falseSuccessor = block.getFalseSuccessor();
      if (falseSuccessor) viewerEdges.push(createEdge(block, falseSuccessor, "false"));
    } else {
      block.getSuccessors().forEach((successorBlock) => {
        viewerEdges.push(createEdge(block, successorBlock));
      });
    }
  });

  if (viewerEdges.length > 0) {
    return { nodes: new DataSet(viewerNodes), edges: new DataSet(viewerEdges) };
  } else {
    return { nodes: new DataSet(viewerNodes) };
  }
}

function createEdge(start: CfgBlock, end: CfgBlock, label?: string) {
  if (label) {
    return { id: start.id + "-" + end.id, from: start.id, to: end.id, arrows: "to", label };
  } else {
    return { id: start.id + "-" + end.id, from: start.id, to: end.id, arrows: "to"};
  }
}
