/*
 * SonarTS
 * Copyright (C) 2017-2018 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import * as tslint from "tslint";
import * as ts from "typescript";
import { SonarRuleMetaData } from "../sonarRule";
import { SonarRuleVisitor } from "../utils/sonarAnalysis";
import { ancestorsChain } from "../utils/navigation";
import { is } from "../utils/nodes";

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "max-union-size",
    description: "Union types should not have too many elements",
    rationale: tslint.Utils.dedent``,
    optionsDescription: "Maximum elements authorized in a union type definition.",
    options: { type: "number" },
    rspecKey: "RSPEC-4622",
    type: "maintainability",
    typescriptOnly: true,
    optionExamples: [[true, 5]],
  };

  private static readonly DEFAULT_MAX = 3;

  private get max(): number {
    return this.ruleArguments[0] || Rule.DEFAULT_MAX;
  }

  public static message(max: number) {
    return `Refactor this union type to have less than ${max} elements.`;
  }

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName, this.max).visit(sourceFile).getIssues();
  }
}

class Visitor extends SonarRuleVisitor {
  constructor(ruleName: string, private readonly max: number) {
    super(ruleName);
  }
  public visitUnionTypeNode(node: ts.UnionTypeNode) {
    if (node.types.length > this.max && !this.isFromTypeStatement(node)) {
      this.addIssue(node, Rule.message(this.max));
    }
    super.visitUnionTypeNode(node);
  }

  private isFromTypeStatement(node: ts.UnionTypeNode) {
    return ancestorsChain(node).some(parent => is(parent, ts.SyntaxKind.TypeAliasDeclaration));
  }
}
