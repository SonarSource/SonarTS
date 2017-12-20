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
import { SonarRuleMetaData } from "../sonarRule";
import { execute } from "../se/SymbolicExecution";
import { build } from "../cfg/builder";
import { ProgramState, createInitialState } from "../se/programStates";
import { isTruthy, Constraint, isFalsy } from "../se/constraints";
import { SymbolTableBuilder } from "../symbols/builder";
import { SymbolTable, UsageFlag } from "../symbols/table";
import { firstLocalAncestor, FUNCTION_LIKE, is } from "../utils/navigation";

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-gratuitous-expressions",
    description: 'Conditions should not always evaluate to "true" or to "false" ',
    rationale: tslint.Utils.dedent`
      If an expression doesn't change the evaluation of the condition,
      then it is either unnecessary, and condition can be removed,
      or it makes some code being never executed. In any case, the code should be refactored.`,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-2589",
    type: "functionality",
    typescriptOnly: false,
  };

  public static getMessage(value: string) {
    return `This condition always evaluates to "${value}".`;
  }

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    const symbols = SymbolTableBuilder.build(sourceFile, program);
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions(), program, symbols));
  }
}

class Walker extends tslint.ProgramAwareRuleWalker {
  public constructor(
    sourceFile: ts.SourceFile,
    options: tslint.IOptions,
    program: ts.Program,
    private readonly symbols: SymbolTable,
  ) {
    super(sourceFile, options, program);
  }

  protected visitNode(node: ts.Node) {
    if (is(node, ...FUNCTION_LIKE)) {
      const functionLike = node as ts.FunctionLikeDeclaration;
      const statements = this.getStatements(functionLike);
      if (statements) {
        const initialState = createInitialState(functionLike, this.getProgram());
        const shouldTrackSymbol = (symbol: ts.Symbol) =>
          this.symbols
            .allUsages(symbol)
            .filter(usage => usage.is(UsageFlag.WRITE))
            .every(usage => firstLocalAncestor(usage.node, ...FUNCTION_LIKE) === functionLike);
        this.runForStatements(Array.from(statements), initialState, shouldTrackSymbol);
      }
    }
    super.visitNode(node);
  }

  private getStatements(functionLike: ts.FunctionLikeDeclaration) {
    if (ts.isArrowFunction(functionLike)) {
      // `body` can be a block or an expression
      if (ts.isBlock(functionLike.body)) {
        return functionLike.body.statements;
      }
    } else {
      return functionLike.body && functionLike.body.statements;
    }
    return undefined;
  }

  private runForStatements(
    statements: ts.Statement[],
    initialState: ProgramState,
    shouldTrackSymbol: (symbol: ts.Symbol) => boolean,
  ) {
    const cfg = build(statements);
    if (cfg) {
      const result = execute(cfg, this.symbols, initialState, shouldTrackSymbol);
      if (result) {
        result.branchingProgramNodes.forEach((states, branchingProgramPoint) => {
          if (this.ifAllProgramStateConstraints(states, isTruthy)) {
            this.addFailureAtNode(branchingProgramPoint, Rule.getMessage("true"));
          } else if (this.ifAllProgramStateConstraints(states, isFalsy)) {
            this.addFailureAtNode(branchingProgramPoint, Rule.getMessage("false"));
          }
        });
      }
    }
  }

  private ifAllProgramStateConstraints(programStates: ProgramState[], checker: (constraints: Constraint[]) => boolean) {
    return programStates.every(programState => {
      const [sv] = programState.popSV();
      return sv !== undefined && checker(programState.getConstraints(sv));
    });
  }
}
