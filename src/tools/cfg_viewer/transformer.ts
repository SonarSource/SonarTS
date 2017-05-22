import * as ts from "typescript";
import { DataSet } from "vis";
import { CfgBlock, ControlFlowGraph } from "../../cfg/cfg";

export interface VisData {
  nodes: DataSet<any>;
  edges?: DataSet<any>;
}

export default function toVisData(cfg: ControlFlowGraph): VisData {
  const viewerNodes: any[] = [];
  const viewerEdges: any[] = [];

  cfg.getBlocks().forEach((block) => {
    viewerNodes.push({ id: block.id, label: blockToLabel(block), physics: false });

    block.getSuccessors().forEach((successorBlock) => {
      viewerEdges.push({ id: block.id + "-" + successorBlock.id, from: block.id, to: successorBlock.id, arrows: "to" });
    });
  });

  if (viewerEdges.length > 0) {
    return { nodes: new DataSet(viewerNodes), edges: new DataSet(viewerEdges) };
  } else {
    return { nodes: new DataSet(viewerNodes) };
  }
}

function blockToLabel(cfgBlock: CfgBlock): string {
  return cfgBlock.id + "\n" + cfgBlock.getElements().join("\n");
}
