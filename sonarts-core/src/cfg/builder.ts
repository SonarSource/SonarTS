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
import { collectLeftHandIdentifiers } from "../utils/navigation";
import { CfgBlock, CfgBranchingBlock, CfgEndBlock, CfgGenericBlock, ControlFlowGraph } from "./cfg";

const { SyntaxKind } = ts;

function getLine(node: ts.Node): number {
  return node.getSourceFile().getLineAndCharacterOfPosition(node.getStart()).line + 1;
}

export class CfgBuilder {
  private end = new CfgEndBlock();
  private blocks: CfgBlock[] = [this.end];
  private breakables: Breakable[] = [];

  public build(statements: ts.NodeArray<ts.Statement>): ControlFlowGraph | undefined {
    const current = this.createBlock();
    current.addSuccessor(this.end);
    try {
      const start = this.buildStatements(current, statements);
      return new ControlFlowGraph(start, this.end, this.blocks);
    } catch (error) {
      return; // Silent for the time being
    }
  }

  private buildStatements(current: CfgBlock, topDownStatements: ts.Statement[]): CfgBlock {
    [...topDownStatements].reverse().forEach(statement => (current = this.buildStatement(current, statement)));
    return current;
  }

  private buildStatement(current: CfgBlock, statement: ts.Statement): CfgBlock {
    switch (statement.kind) {
      case SyntaxKind.EmptyStatement:
        return current;

      case SyntaxKind.Block:
        return this.buildStatements(current, (statement as ts.Block).statements);

      case SyntaxKind.ExpressionStatement:
        return this.buildExpression(current, (statement as ts.ExpressionStatement).expression);

      case SyntaxKind.IfStatement:
        return this.buildIfStatement(current, statement as ts.IfStatement);

      case SyntaxKind.ForStatement:
        return this.buildForStatement(current, statement as ts.ForStatement);

      case SyntaxKind.ForInStatement:
      case SyntaxKind.ForOfStatement:
        return this.buildForEachLoop(current, statement as ts.ForOfStatement | ts.ForInStatement);

      case SyntaxKind.WhileStatement:
        return this.buildWhileStatement(current, statement as ts.WhileStatement);

      case SyntaxKind.DoStatement:
        return this.buildDoStatement(current, statement as ts.DoStatement);

      case SyntaxKind.SwitchStatement:
        return this.buildSwitchStatement(current, statement as ts.SwitchStatement);

      case SyntaxKind.ReturnStatement:
        return this.buildReturnStatement(statement as ts.ReturnStatement);

      // Just add declaration statement as element to the current cfg block. Do not enter inside.
      case SyntaxKind.DebuggerStatement:
      case SyntaxKind.ImportDeclaration:
      case SyntaxKind.MissingDeclaration:
      case SyntaxKind.ClassDeclaration:
      case SyntaxKind.FunctionDeclaration:
      case SyntaxKind.EnumDeclaration:
      case SyntaxKind.ModuleDeclaration:
      case SyntaxKind.NamespaceExportDeclaration:
      case SyntaxKind.ImportEqualsDeclaration:
      case SyntaxKind.ExportDeclaration:
      case SyntaxKind.ExportAssignment:
      case SyntaxKind.TypeAliasDeclaration:
      case SyntaxKind.InterfaceDeclaration:
      case SyntaxKind.ModuleBlock:
        current.addElement(statement);
        return current;

      case SyntaxKind.VariableStatement:
        return this.buildVariableDeclarationList(current, (statement as ts.VariableStatement).declarationList);

      case SyntaxKind.WithStatement:
        const withStatement = statement as ts.WithStatement;
        current = this.buildStatement(current, withStatement.statement);
        return this.buildExpression(current, withStatement.expression);

      case SyntaxKind.ThrowStatement:
        const throwStatement = statement as ts.ThrowStatement;
        const throwBlock = this.createBlockPredecessorOf(this.end);
        throwBlock.addElement(throwStatement);
        return this.buildExpression(throwBlock, throwStatement.expression);

      case SyntaxKind.LabeledStatement:
        return this.buildLabeledStatement(current, statement as ts.LabeledStatement);

      case SyntaxKind.BreakStatement:
        return this.buildBreakStatement(statement as ts.BreakStatement);

      case SyntaxKind.ContinueStatement:
        return this.buildContinueStatement(statement as ts.ContinueStatement);

      case SyntaxKind.TryStatement:
        throw new Error("No support for 'try' statement in CFG builder.");

      // NotEmittedStatement should not appear in visited syntax tree
      case SyntaxKind.NotEmittedStatement:
      default:
        throw new Error("Unknown statement: " + SyntaxKind[statement.kind]);
    }
  }

  private createNotLoopBreakable(breakTarget: CfgBlock, label: ts.Identifier | null) {
    const breakable = new Breakable();
    breakable.breakTarget = breakTarget;
    if (label) {
      breakable.label = label.text;
    }
    this.breakables.push(breakable);
  }

  private createLoopBreakable(breakTarget: CfgBlock, continueTarget: CfgBlock, loop: ts.IterationStatement) {
    const breakable = new Breakable();
    breakable.breakTarget = breakTarget;
    breakable.continueTarget = continueTarget;
    const label = CfgBuilder.getLabel(loop);
    if (label) {
      breakable.label = label.text;
    }
    this.breakables.push(breakable);
  }

  private static getLabel(statement: ts.IterationStatement | ts.SwitchStatement): ts.Identifier | null {
    if (statement.parent!.kind === SyntaxKind.LabeledStatement) {
      return (statement.parent! as ts.LabeledStatement).label;
    }

    return null;
  }

  private buildContinueStatement(continueStatement: ts.ContinueStatement): CfgBlock {
    let breakable;
    const label = continueStatement.label;
    if (label) {
      breakable = this.breakables.find(b => b.label === label.getText());
    } else {
      breakable = [...this.breakables].reverse().find(b => !!b.continueTarget);
    }
    if (breakable) {
      const continueTarget = breakable.continueTarget;
      return this.createBlockPredecessorOf(continueTarget!);
    } else {
      throw new Error("No point found to continue for continue-statement at line " + getLine(continueStatement));
    }
  }

  private buildBreakStatement(breakStatement: ts.BreakStatement): CfgBlock {
    let breakable;
    const label = breakStatement.label;
    if (label) {
      breakable = this.breakables.find(b => b.label === label.getText());
    } else {
      breakable = this.breakables[this.breakables.length - 1];
    }

    if (breakable) {
      const breakTarget = breakable.breakTarget;
      return this.createBlockPredecessorOf(breakTarget);
    } else {
      throw new Error("No break target found for break-statement at line " + getLine(breakStatement));
    }
  }

  private buildLabeledStatement(current: CfgBlock, labeledStatement: ts.LabeledStatement): CfgBlock {
    const labeledLoop = isLoop(labeledStatement.statement);
    const startOfLabeledStatementPlaceholder = this.createBlock();
    if (!labeledLoop) this.createNotLoopBreakable(current, labeledStatement.label);
    const startOfLabeledStatement = this.buildStatement(
      this.createBlockPredecessorOf(current),
      labeledStatement.statement,
    );
    startOfLabeledStatementPlaceholder.addSuccessor(startOfLabeledStatement);
    if (!labeledLoop) this.breakables.pop();
    return startOfLabeledStatementPlaceholder;

    function isLoop(statement: ts.Statement): boolean {
      return [
        SyntaxKind.WhileStatement,
        SyntaxKind.DoStatement,
        SyntaxKind.ForStatement,
        SyntaxKind.ForInStatement,
        SyntaxKind.ForOfStatement,
      ].includes(statement.kind);
    }
  }

  private buildDoStatement(current: CfgBlock, doWhileLoop: ts.DoStatement): CfgBlock {
    const whileConditionStartBlockPlaceholder = this.createBlock();
    this.createLoopBreakable(current, whileConditionStartBlockPlaceholder, doWhileLoop);
    const doBlockEnd = this.createBlock();
    const doBlockStart = this.buildStatement(doBlockEnd, doWhileLoop.statement);
    const whileBlockEnd = this.createBranchingBlock(
      "do while(" + doWhileLoop.expression.getText() + ")",
      doBlockStart,
      current,
    );
    const whileConditionStartBlock = this.buildExpression(whileBlockEnd, doWhileLoop.expression);
    doBlockEnd.addSuccessor(whileConditionStartBlockPlaceholder);
    whileConditionStartBlockPlaceholder.addSuccessor(whileConditionStartBlock);
    whileConditionStartBlock.loopingStatement = doWhileLoop;
    this.breakables.pop();
    return this.createBlockPredecessorOf(doBlockStart);
  }

  private buildWhileStatement(current: CfgBlock, whileLoop: ts.WhileStatement): CfgBlock {
    const loopStartPlaceholder = this.createBlock();
    this.createLoopBreakable(current, loopStartPlaceholder, whileLoop);
    const loopBottom = this.createBlock();
    const firstLoopStatementBlock = this.buildStatement(loopBottom, whileLoop.statement);
    const loopStart = this.buildExpression(
      this.createWhileRootBlock(whileLoop, firstLoopStatementBlock, current),
      whileLoop.expression,
    );
    loopStartPlaceholder.addSuccessor(loopStart);
    loopBottom.addSuccessor(loopStartPlaceholder);
    loopStartPlaceholder.loopingStatement = whileLoop;
    this.breakables.pop();
    return this.createBlockPredecessorOf(loopStartPlaceholder);
  }

  private createWhileRootBlock(
    whileLoop: ts.WhileStatement,
    firstLoopStatementBlock: CfgBlock,
    current: CfgBlock,
  ): CfgBlock {
    if (whileLoop.expression.kind === SyntaxKind.TrueKeyword) {
      return this.createBlockPredecessorOf(firstLoopStatementBlock);
    } else {
      return this.createBranchingBlock(
        "while(" + whileLoop.expression.getText() + ")",
        firstLoopStatementBlock,
        current,
      );
    }
  }

  private buildForEachLoop(current: CfgBlock, forEach: ts.ForOfStatement | ts.ForInStatement): CfgBlock {
    const loopBodyEnd = this.createBlock();
    const continueTarget = this.createBlock();
    this.createLoopBreakable(current, continueTarget, forEach);
    const loopBodyStart = this.buildStatement(loopBodyEnd, forEach.statement);
    const branchingBlock = this.createBranchingBlock(this.forEachLoopLabel(forEach), loopBodyStart, current);
    const initializerStart = this.buildForInitializer(branchingBlock, forEach.initializer);
    const loopStart = this.buildExpression(this.createBlockPredecessorOf(initializerStart), forEach.expression);
    loopBodyEnd.addSuccessor(initializerStart);
    continueTarget.addSuccessor(initializerStart);
    initializerStart.loopingStatement = forEach;
    this.breakables.pop();
    return loopStart;
  }

  private buildForStatement(current: CfgBlock, forLoop: ts.ForStatement): CfgBlock {
    const loopBottom = this.createBlock();
    let lastBlockInLoopStatement: CfgBlock = loopBottom;
    const continueTarget = this.createBlock();

    if (forLoop.incrementor) {
      lastBlockInLoopStatement = this.buildExpression(lastBlockInLoopStatement, forLoop.incrementor);
    }

    this.createLoopBreakable(current, continueTarget, forLoop);

    const firstBlockInLoopStatement = this.buildStatement(
      this.createBlockPredecessorOf(lastBlockInLoopStatement),
      forLoop.statement,
    );
    let loopRoot: CfgBlock;
    if (forLoop.condition) {
      loopRoot = this.buildExpression(
        this.createBranchingBlock(this.forLoopLabel(forLoop), firstBlockInLoopStatement, current),
        forLoop.condition,
      );
    } else {
      loopRoot = this.createBlockPredecessorOf(firstBlockInLoopStatement);
    }
    let loopStart = loopRoot;
    if (forLoop.initializer) {
      loopStart = this.buildForInitializer(this.createBlockPredecessorOf(loopRoot), forLoop.initializer);
    }
    loopBottom.addSuccessor(loopRoot);
    loopRoot.loopingStatement = forLoop;

    if (forLoop.incrementor) {
      continueTarget.addSuccessor(lastBlockInLoopStatement);
    } else if (forLoop.condition) {
      continueTarget.addSuccessor(loopRoot);
    } else {
      continueTarget.addSuccessor(firstBlockInLoopStatement);
    }

    this.breakables.pop();
    return this.createBlockPredecessorOf(loopStart);
  }

  private buildIfStatement(current: CfgBlock, ifStatement: ts.IfStatement): CfgBlock {
    let whenFalse = current;
    if (ifStatement.elseStatement) {
      whenFalse = this.buildStatement(this.createBlockPredecessorOf(current), ifStatement.elseStatement);
    }
    const whenTrue = this.buildStatement(this.createBlockPredecessorOf(current), ifStatement.thenStatement);
    return this.buildExpression(
      this.createBranchingBlock("if (" + ifStatement.expression.getText() + ")", whenTrue, whenFalse),
      ifStatement.expression,
    );
  }

  private buildSwitchStatement(current: CfgBlock, switchStatement: ts.SwitchStatement): CfgBlock {
    this.createNotLoopBreakable(current, CfgBuilder.getLabel(switchStatement));
    const afterSwitchBlock = current;
    let defaultBlockEnd: CfgGenericBlock | undefined;
    let defaultBlock: CfgBlock | undefined;

    switchStatement.caseBlock.clauses.forEach(caseClause => {
      if (caseClause.kind === ts.SyntaxKind.DefaultClause) {
        defaultBlockEnd = this.createBlock();
        defaultBlock = this.buildStatements(defaultBlockEnd, caseClause.statements);
      }
    });
    let currentClauseStatementsStart: CfgBlock = afterSwitchBlock;
    let nextBlock = defaultBlock ? defaultBlock : afterSwitchBlock;
    [...switchStatement.caseBlock.clauses].reverse().forEach(caseClause => {
      if (caseClause.kind === ts.SyntaxKind.CaseClause) {
        currentClauseStatementsStart = this.buildStatements(
          this.createBlockPredecessorOf(currentClauseStatementsStart),
          caseClause.statements,
        );
        const currentClauseExpressionEnd = this.createBranchingBlock(
          caseClause.expression.getText(),
          currentClauseStatementsStart,
          nextBlock,
        );
        const currentClauseExpressionStart = this.buildExpression(currentClauseExpressionEnd, caseClause.expression);
        nextBlock = currentClauseExpressionStart;
      } else {
        (defaultBlockEnd as CfgGenericBlock).addSuccessor(currentClauseStatementsStart);
        currentClauseStatementsStart = defaultBlock as CfgBlock;
      }
    });
    this.breakables.pop();
    return this.buildExpression(nextBlock, switchStatement.expression);
  }

  private buildReturnStatement(returnStatement: ts.ReturnStatement): CfgBlock {
    const returnBlock = this.createBlockPredecessorOf(this.end);
    returnBlock.addElement(returnStatement);
    return returnStatement.expression ? this.buildExpression(returnBlock, returnStatement.expression) : returnBlock;
  }

  private buildForInitializer(current: CfgBlock, forInitializer: ts.Expression | ts.VariableDeclarationList): CfgBlock {
    return forInitializer.kind === ts.SyntaxKind.VariableDeclarationList
      ? this.buildVariableDeclarationList(current, forInitializer as ts.VariableDeclarationList)
      : this.buildExpression(current, forInitializer);
  }

  private buildVariableDeclarationList(current: CfgBlock, variableDeclarations: ts.VariableDeclarationList): CfgBlock {
    [...variableDeclarations.declarations].reverse().forEach(variableDeclaration => {
      if (variableDeclaration.initializer) {
        current.addElement(variableDeclaration);
        current = this.buildExpression(current, variableDeclaration.initializer);
      }
      current = this.buildBindingName(current, variableDeclaration.name);
    });
    return current;
  }

  private buildBindingName(current: CfgBlock, bindingName: ts.BindingName): CfgBlock {
    const buildElements = (elements: ts.NodeArray<ts.BindingElement | ts.OmittedExpression>) => {
      [...elements].reverse().forEach(element => (current = this.buildBindingElement(current, element)));
    };

    switch (bindingName.kind) {
      case ts.SyntaxKind.Identifier:
        current = this.buildExpression(current, bindingName);
        break;
      case ts.SyntaxKind.ObjectBindingPattern:
        const objectBindingPattern = bindingName as ts.ObjectBindingPattern;
        buildElements(objectBindingPattern.elements);
        break;
      case ts.SyntaxKind.ArrayBindingPattern:
        const arrayBindingPattern = bindingName as ts.ArrayBindingPattern;
        buildElements(arrayBindingPattern.elements);
        break;
    }
    return current;
  }

  private buildBindingElement(current: CfgBlock, bindingElement: ts.BindingElement | ts.OmittedExpression): CfgBlock {
    if (bindingElement.kind !== ts.SyntaxKind.OmittedExpression) {
      current = this.buildBindingName(current, bindingElement.name);

      if (bindingElement.initializer) {
        current = this.buildExpression(current, bindingElement.initializer);
      }
    }
    return current;
  }

  private buildExpression(current: CfgBlock, expression: ts.Expression): CfgBlock {
    switch (expression.kind) {
      case SyntaxKind.CallExpression:
        current.addElement(expression);
        const callExpression = expression as ts.CallExpression;

        [...callExpression.arguments].reverse().forEach(arg => {
          current = this.buildExpression(current, arg);
        });
        return this.buildExpression(current, callExpression.expression);

      case SyntaxKind.ConditionalExpression:
        const conditionalExpression = expression as ts.ConditionalExpression;
        const whenFalse = this.buildExpression(this.createBlockPredecessorOf(current), conditionalExpression.whenFalse);
        const whenTrue = this.buildExpression(this.createBlockPredecessorOf(current), conditionalExpression.whenTrue);
        return this.buildExpression(
          this.createBranchingBlock(expression.getText(), whenTrue, whenFalse),
          conditionalExpression.condition,
        );

      case SyntaxKind.BinaryExpression:
        return this.buildBinaryExpression(current, expression as ts.BinaryExpression);

      case SyntaxKind.ParenthesizedExpression:
        current.addElement(expression);
        return this.buildExpression(current, (expression as ts.ParenthesizedExpression).expression);

      case SyntaxKind.ObjectLiteralExpression:
        return this.buildObjectLiteralExpression(current, expression as ts.ObjectLiteralExpression);

      case SyntaxKind.TrueKeyword:
      case SyntaxKind.FalseKeyword:
      case SyntaxKind.NumericLiteral:
      case SyntaxKind.StringLiteral:
      case SyntaxKind.RegularExpressionLiteral:
      case SyntaxKind.SuperKeyword:
      case SyntaxKind.ThisKeyword:
      case SyntaxKind.NullKeyword:
      case SyntaxKind.Identifier:
      case SyntaxKind.NoSubstitutionTemplateLiteral:
      case SyntaxKind.MetaProperty:
        current.addElement(expression);
        return current;

      case SyntaxKind.OmittedExpression:
        // empty element, do nothing
        return current;

      case SyntaxKind.ArrayLiteralExpression:
        current.addElement(expression);
        const arrayLiteral = expression as ts.ArrayLiteralExpression;
        [...arrayLiteral.elements].reverse().forEach(element => (current = this.buildExpression(current, element)));
        return current;

      case SyntaxKind.TemplateExpression:
        current.addElement(expression);
        const templateExpression = expression as ts.TemplateExpression;
        [...templateExpression.templateSpans]
          .reverse()
          .forEach(span => (current = this.buildExpression(current, span.expression)));
        return current;

      case SyntaxKind.FunctionExpression:
      case SyntaxKind.ArrowFunction:
      case SyntaxKind.ClassExpression:
        current.addElement(expression);
        return current;

      case SyntaxKind.PropertyAccessExpression:
        current.addElement(expression);
        const propertyAccessExpression = expression as ts.PropertyAccessExpression;
        return this.buildExpression(current, propertyAccessExpression.expression);

      case SyntaxKind.ElementAccessExpression:
        current.addElement(expression);
        const elementAccessExpression = expression as ts.ElementAccessExpression;
        // it's not clear why ElementAccessExpression.argumentExpression is optional
        if (elementAccessExpression.argumentExpression) {
          current = this.buildExpression(current, elementAccessExpression.argumentExpression);
        }
        return this.buildExpression(current, elementAccessExpression.expression);

      case SyntaxKind.NewExpression:
        current.addElement(expression);
        const newExpression = expression as ts.NewExpression;
        if (newExpression.arguments) {
          [...newExpression.arguments].reverse().forEach(arg => {
            current = this.buildExpression(current, arg);
          });
        }
        return this.buildExpression(current, newExpression.expression);

      case SyntaxKind.TaggedTemplateExpression:
        current.addElement(expression);
        const taggedTemplateExpression = expression as ts.TaggedTemplateExpression;
        current = this.buildExpression(current, taggedTemplateExpression.template);
        return this.buildExpression(current, taggedTemplateExpression.tag);

      case SyntaxKind.TypeAssertionExpression:
        current.addElement(expression);
        const typeAssertionExpression = expression as ts.TypeAssertion;
        return this.buildExpression(current, typeAssertionExpression.expression);

      case SyntaxKind.DeleteExpression:
      case SyntaxKind.TypeOfExpression:
      case SyntaxKind.VoidExpression:
      case SyntaxKind.AwaitExpression:
      case SyntaxKind.AsExpression:
      case SyntaxKind.NonNullExpression:
      case SyntaxKind.SpreadElement:
        current.addElement(expression);
        return this.buildExpression(
          current,
          (expression as
            | ts.DeleteExpression
            | ts.TypeAssertion
            | ts.TypeOfExpression
            | ts.VoidExpression
            | ts.AwaitExpression
            | ts.AsExpression
            | ts.NonNullExpression
            | ts.SpreadElement).expression,
        );

      case SyntaxKind.PrefixUnaryExpression:
      case SyntaxKind.PostfixUnaryExpression:
        current.addElement(expression);
        return this.buildExpression(
          current,
          (expression as ts.PrefixUnaryExpression | ts.PostfixUnaryExpression).operand,
        );

      case SyntaxKind.YieldExpression:
        current.addElement(expression);
        const yieldExpression = expression as ts.YieldExpression;
        if (yieldExpression.expression) {
          return this.buildExpression(current, yieldExpression.expression);
        }
        return current;

      case SyntaxKind.JsxElement:
        current.addElement(expression);
        const jsxElement = expression as ts.JsxElement;
        current = this.buildTagName(current, jsxElement.closingElement.tagName);
        [...jsxElement.children].reverse().forEach(jsxChild => (current = this.buildJsxChild(current, jsxChild)));
        return this.buildExpression(current, jsxElement.openingElement);

      case SyntaxKind.JsxExpression:
        // do not add jsxExpression itself to the current block elements
        const jsxExpression = expression as ts.JsxExpression;
        if (jsxExpression.expression) {
          return this.buildExpression(current, jsxExpression.expression);
        }
        return current;

      case SyntaxKind.JsxOpeningElement:
        // do not add jsxOpeningElement itself to the current block elements
        const jsxOpeningElement = expression as ts.JsxOpeningElement;
        current = this.buildJsxAttributes(current, jsxOpeningElement.attributes);
        return this.buildTagName(current, jsxOpeningElement.tagName);

      case SyntaxKind.JsxSelfClosingElement:
        current.addElement(expression);
        const jsxSelfClosingElement = expression as ts.JsxSelfClosingElement;
        current = this.buildJsxAttributes(current, jsxSelfClosingElement.attributes);
        return this.buildTagName(current, jsxSelfClosingElement.tagName);

      default:
        throw new Error("Unknown expression: " + SyntaxKind[expression.kind]);
    }
  }

  private buildTagName(current: CfgBlock, tagName: ts.JsxTagNameExpression) {
    // JSX looks at first letter: capital - JS identifier, small - html tag
    // "this" is the exception of this rule
    if (
      (tagName.kind === ts.SyntaxKind.Identifier && !startsWithLowerCase(tagName.getText())) ||
      tagName.kind !== ts.SyntaxKind.Identifier
    ) {
      return this.buildExpression(current, tagName);
    }
    return current;

    function startsWithLowerCase(str: string): boolean {
      return !!str && str[0].toLocaleLowerCase() === str[0];
    }
  }

  private buildJsxAttributes(current: CfgBlock, jsxAttributes: ts.JsxAttributes): CfgBlock {
    [...jsxAttributes.properties].reverse().forEach(jsxAttributeLike => {
      if (jsxAttributeLike.kind === SyntaxKind.JsxSpreadAttribute) {
        current = this.buildExpression(current, jsxAttributeLike.expression);
      } else if (jsxAttributeLike.initializer && jsxAttributeLike.initializer.kind !== SyntaxKind.StringLiteral) {
        current = this.buildExpression(current, jsxAttributeLike.initializer);
      }
    });
    return current;
  }

  private buildJsxChild(current: CfgBlock, jsxChild: ts.JsxChild): CfgBlock {
    if (jsxChild.kind !== ts.SyntaxKind.JsxText) {
      current = this.buildExpression(current, jsxChild);
    }
    return current;
  }

  private buildBinaryExpression(current: CfgBlock, expression: ts.BinaryExpression): CfgBlock {
    switch (expression.operatorToken.kind) {
      case SyntaxKind.AmpersandAmpersandToken: {
        let whenFalse = current;
        let whenTrue = current;
        if (current instanceof CfgBranchingBlock && current.getElements().length === 0) {
          whenFalse = current.getFalseSuccessor();
        } else {
          whenTrue = this.createBlockPredecessorOf(current);
        }
        whenTrue = this.buildExpression(whenTrue, expression.right);
        const branching = this.createBranchingBlock(expression.left.getText(), whenTrue, whenFalse);
        return this.buildExpression(branching, expression.left);
      }
      case SyntaxKind.BarBarToken: {
        let whenFalse = current;
        let whenTrue = current;
        if (current instanceof CfgBranchingBlock && current.getElements().length === 0) {
          whenTrue = current.getTrueSuccessor();
        } else {
          whenFalse = this.createBlockPredecessorOf(current);
        }
        whenFalse = this.buildExpression(whenFalse, expression.right);
        const branching = this.createBranchingBlock(expression.left.getText(), whenTrue, whenFalse);
        return this.buildExpression(branching, expression.left);
      }
      case SyntaxKind.EqualsToken: {
        current.addElement(expression);
        current = this.buildExpression(current, expression.right);
        collectLeftHandIdentifiers(expression.left).nonIdentifiers.forEach(
          node => (current = this.buildExpression(current, node)),
        );
        return current;
      }
    }

    current.addElement(expression);
    return this.buildExpression(this.buildExpression(current, expression.right), expression.left);
  }

  private buildObjectLiteralExpression(current: CfgBlock, objectLiteral: ts.ObjectLiteralExpression): CfgBlock {
    current.addElement(objectLiteral);
    [...objectLiteral.properties].reverse().forEach(property => {
      switch (property.kind) {
        case SyntaxKind.PropertyAssignment:
          current = this.buildExpression(current, property.initializer);
          break;
        case SyntaxKind.ShorthandPropertyAssignment:
          if (property.objectAssignmentInitializer) {
            current = this.buildExpression(current, property.objectAssignmentInitializer);
          }
          break;
        case SyntaxKind.SpreadAssignment:
          current = this.buildExpression(current, property.expression);
          break;
      }
      if (property.name) {
        switch (property.name.kind) {
          case SyntaxKind.ComputedPropertyName:
            current = this.buildExpression(current, property.name.expression);
            break;
          case SyntaxKind.NumericLiteral:
          case SyntaxKind.StringLiteral:
          case SyntaxKind.Identifier:
            if (property.kind === SyntaxKind.ShorthandPropertyAssignment) {
              current = this.buildExpression(current, property.name);
            }
            break;
        }
      }
    });
    return current;
  }

  private createBranchingBlock(
    branchingLabel: string,
    trueSuccessor: CfgBlock,
    falseSuccessor: CfgBlock,
  ): CfgBranchingBlock {
    const block = new CfgBranchingBlock(branchingLabel, trueSuccessor, falseSuccessor);
    this.blocks.push(block);
    return block;
  }

  private createBlock(): CfgGenericBlock {
    const block = new CfgGenericBlock();
    this.blocks.push(block);
    return block;
  }

  private createBlockPredecessorOf(successor: CfgBlock) {
    const predecessor = this.createBlock();
    predecessor.addSuccessor(successor);
    return predecessor;
  }

  private forLoopLabel(forLoop: ts.ForStatement) {
    return (
      "for(" +
      textOrEmpty(forLoop.initializer) +
      ";" +
      textOrEmpty(forLoop.condition) +
      ";" +
      textOrEmpty(forLoop.incrementor) +
      ")"
    );

    function textOrEmpty(node?: ts.Node): string {
      if (node) return node.getText();
      return "";
    }
  }

  private forEachLoopLabel(forEachLoop: ts.ForOfStatement | ts.ForInStatement) {
    const keyword = forEachLoop.kind === SyntaxKind.ForInStatement ? "in" : "of";
    return `for(${forEachLoop.initializer.getText()} ${keyword} ${forEachLoop.expression.getText()})`;
  }
}

class Breakable {
  public continueTarget?: CfgBlock;
  public breakTarget: CfgBlock;
  public label: string | null;
}
