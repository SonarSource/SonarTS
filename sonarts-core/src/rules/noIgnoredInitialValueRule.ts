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
import * as tslint from "tslint";
import * as ts from "typescript";
import { SymbolTableBuilder } from "../symbols/builder";
import { SymbolTable, UsageFlag } from "../symbols/table";
import { SonarRuleMetaData } from "../sonarRule";
import { is, FUNCTION_LIKE, descendants, ancestorsChain } from "../utils/navigation";
import { LiveVariableAnalyzer, LVAReturn } from "../symbols/lva";
import { ControlFlowGraph } from "../cfg/cfg";

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-ignored-initial-value",
    description: "Function parameters, caught exceptions and foreach variables' initial values should not be ignored",
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-1226",
    type: "functionality",
    typescriptOnly: false,
  };

  public static formatMessage(deadIdentifier: ts.Identifier) {
    return `Introduce a new variable or use its initial value before reassigning "${deadIdentifier.getText()}".`;
  }

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    const symbols = SymbolTableBuilder.build(sourceFile, program);
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions(), program, symbols));
  }
}

class Walker extends tslint.ProgramAwareRuleWalker {
  private lva: LiveVariableAnalyzer;

  constructor(
    sourceFile: ts.SourceFile,
    options: tslint.IOptions,
    program: ts.Program,
    private readonly symbols: SymbolTable,
  ) {
    super(sourceFile, options, program);
    this.lva = new LiveVariableAnalyzer(this.symbols);
  }

  protected visitNode(node: ts.Node): void {
    if (is(node, ...FUNCTION_LIKE)) {
      const functionLike = node as ts.FunctionLikeDeclaration;
      const lvaReturn = this.lva.analyzeFunction(functionLike);
      this.check(functionLike.body!, lvaReturn, ...functionLike.parameters);
    } else if (is(node, ts.SyntaxKind.CatchClause)) {
      const catchClause = node as ts.CatchClause;
      const cfg = ControlFlowGraph.fromStatements(catchClause.block.statements);
      if (!cfg) return;
      const lvaReturn = this.lva.analyze(catchClause.block, cfg);
      this.check(catchClause.block, lvaReturn, catchClause.variableDeclaration);
    } else if (is(node, ts.SyntaxKind.ForInStatement, ts.SyntaxKind.ForOfStatement)) {
      const iterationStatement = node as ts.IterationStatement;
      const cfg = ControlFlowGraph.fromStatements([iterationStatement.statement]);
      if (!cfg) return;
      const lvaReturn = this.lva.analyze(iterationStatement, cfg);
      this.check(iterationStatement.statement, lvaReturn, (iterationStatement as ts.ForInStatement).initializer);
    }

    super.visitNode(node);
  }

  private check(root: ts.Node, lvaReturn?: LVAReturn, ...nodesToCheck: ts.Node[]) {
    if (!lvaReturn) {
      return;
    }
    const { cfg, blockAvailableReads } = lvaReturn;
    const symbolsLiveAtStart = blockAvailableReads.get(cfg.start)!;

    nodesToCheck.forEach(parameter => {
      descendants(parameter)
        .filter(descendant => is(descendant, ts.SyntaxKind.Identifier))
        .forEach(descendant => {
          const identifier = descendant as ts.Identifier;
          const symbol = this.getTypeChecker().getSymbolAtLocation(identifier);
          if (
            symbol &&
            !symbolsLiveAtStart.has(symbol) &&
            isVariableOrParameter(symbol) &&
            this.onlyUsedLocallyToRoot(symbol, root) &&
            this.symbols.allUsages(symbol).length > 1
          ) {
            this.addFailureAtNode(identifier, Rule.formatMessage(identifier));
          }
        });
    });
  }

  private onlyUsedLocallyToRoot(symbol: ts.Symbol, root: ts.Node): boolean {
    const boundaries = [
      ...FUNCTION_LIKE,
      ts.SyntaxKind.SourceFile,
      ts.SyntaxKind.ClassDeclaration,
      ts.SyntaxKind.ClassExpression,
    ];
    return this.symbols
      .allUsages(symbol)
      .every(usage => usage.is(UsageFlag.DECLARATION) || ancestorsChain(usage.node, ...boundaries).includes(root));
  }
}

function isVariableOrParameter(symbol: ts.Symbol) {
  return symbol.flags === ts.SymbolFlags.BlockScopedVariable || symbol.flags === ts.SymbolFlags.FunctionScopedVariable;
}
