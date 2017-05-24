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
    const current = this.createBlock();
    current.addSuccessor(this.end);
    const start = this.buildStatements(current, statements);

    const graph = new ControlFlowGraph();
    graph.addStart(start);
    graph.finalize();
    start.addElement(({ getText() { return "START"; } } as ts.Expression));
    return graph;
  }

  private buildStatements(current: CfgBlock, topDownStatements: ts.Statement[]): CfgBlock {
    let next = current;
    const statements = [...topDownStatements].reverse();

    statements.forEach(statement => {
      switch (statement.kind) {
        case SyntaxKind.Block: {
          const block = statement as ts.Block;
          next = this.buildStatements(next, block.statements);
          break;
        }
        case SyntaxKind.ExpressionStatement:
          next = this.buildExpression(next, (statement as ts.ExpressionStatement).expression);
          break;
        case SyntaxKind.IfStatement: {
          const ifStatement = statement as ts.IfStatement;
          let whenFalse;
          if (ifStatement.elseStatement) {
            whenFalse = this.buildStatements(this.createPredecessorBlock(current), [ifStatement.elseStatement]);
          } else {
            whenFalse = next;
          }
          const whenTrue = this.buildStatements(this.createPredecessorBlock(current), [ifStatement.thenStatement]);
          next = this.buildExpression(
            new CfgBranchingBlock("if (" + ifStatement.expression.getText() + ")", whenTrue, whenFalse),
            ifStatement.expression,
          );
          break;
        }
        case SyntaxKind.ForStatement: {
          const forLoop = statement as ts.ForStatement;
          const loopBottom = new CfgBlock();
          let lastLoopStatementBlock = loopBottom;
          if (forLoop.incrementor) {
            lastLoopStatementBlock = this.buildExpression(lastLoopStatementBlock, forLoop.incrementor);
          }
          const firstLoopStatementBlock = this.buildStatements(lastLoopStatementBlock, [forLoop.statement]);
          let loopRoot: CfgBlock;
          if (forLoop.condition) {
            loopRoot = this.buildExpression(
              new CfgBranchingBlock(this.forLoopLabel(forLoop), firstLoopStatementBlock, next), forLoop.condition);
          } else {
            loopRoot = this.createPredecessorBlock(firstLoopStatementBlock);
          }
          let loopStart = loopRoot;
          if (forLoop.initializer) {
            loopStart = this.buildExpression(this.createPredecessorBlock(loopRoot), forLoop.initializer);
          }
          loopBottom.addSuccessor(loopRoot);
          next = loopStart;
          break;
        }
        case SyntaxKind.WhileStatement: {
          const whileLoop = statement as ts.WhileStatement;
          const loopBottom = new CfgBlock();
          const firstLoopStatementBlock = this.buildStatements(loopBottom, [whileLoop.statement]);
          const loopStart = this.buildExpression(
            new CfgBranchingBlock("while(" + whileLoop.expression.getText() + ")", firstLoopStatementBlock, next),
            whileLoop.expression,
          );
          loopBottom.addSuccessor(loopStart);
          next = loopStart;
          break;
        }
        case SyntaxKind.ReturnStatement: {
          const returnStatement = statement as ts.ReturnStatement;
          if (returnStatement.expression) {
            next = this.buildExpression(this.createPredecessorBlock(this.end), returnStatement.expression);
          } else {
            next = this.createPredecessorBlock(this.end);
          }
          break;
        }
        default:
          throw new Error("Unknown statement: " + SyntaxKind[statement.kind]);
      }
    });

    return next;
  }

  private buildExpression(current: CfgBlock, expression: ts.Expression | ts.VariableDeclarationList): CfgBlock {
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
        return this.buildExpression(
          new CfgBranchingBlock(expression.getText(), whenTrue, whenFalse), conditionalExpression.condition,
        );
      }
      case SyntaxKind.BinaryExpression: {
        const binaryExpression = expression as ts.BinaryExpression;
        current.addElement(expression);
        if (binaryExpression.operatorToken.kind === SyntaxKind.EqualsToken) {
          const right = this.buildExpression(current, binaryExpression.right);
          return this.buildExpression(right, binaryExpression.left);
        }
      }
      case SyntaxKind.TrueKeyword:
      case SyntaxKind.FalseKeyword:
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
    const predecessor = new CfgBlock();
    predecessor.addSuccessor(successor);
    return predecessor;
  }

  private forLoopLabel(forLoop: ts.ForStatement) {
    return "for(" +
      textOrEmpty(forLoop.initializer) +
      "\;" + textOrEmpty(forLoop.condition) +
      "\;" + textOrEmpty(forLoop.incrementor) +
      ")";

    function textOrEmpty(node?: ts.Node): string {
      if (node) return node.getText();
      return "";
    }
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
      block.getSuccessors().forEach((successor, i) => collectBlocks(successor, baseId + "\." + (i + 1)));
    }
  }

  public finalize() {
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
  private falseSuccessor?: CfgBlock;

  constructor(branchingLabel: string, trueSuccessor: CfgBlock, falseSuccessor?: CfgBlock) {
    super();
    this.branchingLabel = branchingLabel;
    this.trueSuccessor = trueSuccessor;
    this.falseSuccessor = falseSuccessor;
    this.falseSuccessor = falseSuccessor;
    this.addSuccessor(trueSuccessor);
    if (falseSuccessor) {
      this.addSuccessor(falseSuccessor);
    }
  }

  public getTrueSuccessor(): CfgBlock {
    return this.trueSuccessor;
  }

  public getFalseSuccessor(): CfgBlock | undefined {
    return this.falseSuccessor;
  }

  public getLabel(): string {
    return super.getLabel() + "\n" + "<" + this.branchingLabel + ">";
  }
}
