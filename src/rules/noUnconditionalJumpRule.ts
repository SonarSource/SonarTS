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
import * as nav from "../utils/navigation";

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    description: "Jumo statements should not be used unconditionally",
    options: null,
    optionsDescription: "",
    rspecKey: "RSPEC-1751",
    ruleName: "no-unconditional-jump",
    type: "functionality",
    typescriptOnly: false,
  };

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions(), program));
  }
}

class Walker extends tslint.ProgramAwareRuleWalker {

  public visitBreakStatement(node: ts.BreakOrContinueStatement): void {
    this.checkJump(node);
  }

  public visitContinueStatement(node: ts.BreakOrContinueStatement) {
    this.checkJump(node);
  }

  public visitThrowStatement(node: ts.ThrowStatement) {
    this.checkJump(node);
  }

  public visitReturnStatement(node: ts.ReturnStatement) {
    this.checkJump(node);
  }

  private checkJump(node: ts.BreakOrContinueStatement | ts.ThrowStatement | ts.ReturnStatement) {
    if (this.isConditional(node)) return;
    if (node.kind === ts.SyntaxKind.BreakStatement && this.isInsideForIn(node)) return;
    const keyword = nav.keyword(node);
    this.addFailureAt(keyword.getStart(), keyword.getWidth(), `Remove this "${keyword.getText()}" statement or make it conditional`);
  }

  private isConditional(node: ts.Node): boolean {
    const parents = nav.parentsChain(node).map(p => p.kind);
    const conditionalsAndLoops = parents.filter(kind => nav.LOOP_STATEMENTS.has(kind) || nav.CONDITIONAL_STATEMENTS.has(kind));
    return conditionalsAndLoops.length > 0 && nav.CONDITIONAL_STATEMENTS.has(conditionalsAndLoops[0]);
  }

  private isInsideForIn(node: ts.BreakStatement): boolean {
    const parents = nav.parentsChain(node).map(p => p.kind);
    const loops = parents.filter(kind => nav.LOOP_STATEMENTS.has(kind));
    return loops.length > 0 && loops[0] === ts.SyntaxKind.ForInStatement;
  }

}
