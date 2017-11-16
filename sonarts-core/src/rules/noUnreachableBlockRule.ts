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

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-unreachable-block",
    description: "Conditionally executed blocks should be reachable",
    rationale: tslint.Utils.dedent`
      Conditional expressions which are always "true" or "false" can lead to dead code. Such code is always buggy and 
      should never be used in production.`,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-2583",
    type: "functionality",
    typescriptOnly: false,
  };

  public static getMessage(value: string) {
    return `This condition always evaluates to "${value}".`;
  }

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions(), program));
  }
}

class Walker extends tslint.ProgramAwareRuleWalker {
  protected visitFunctionDeclaration(node: ts.FunctionDeclaration) {
    const { body } = node;
    if (body) {
      const cfg = build(Array.from(body.statements));
      if (!cfg) {
        return;
      }
      const result = execute(cfg, this.getProgram(), createInitialState(node, this.getProgram()));
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
    super.visitFunctionDeclaration(node);
  }

  private ifAllProgramStateConstraints(programStates: ProgramState[], checker: (constraints: Constraint[]) => boolean) {
    return programStates.every(programState => {
      const [sv] = programState.popSV();
      return sv !== undefined && checker(programState.getConstraints(sv));
    });
  }
}
