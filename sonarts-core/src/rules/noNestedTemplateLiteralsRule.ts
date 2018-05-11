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
    ruleName: "no-nested-template-literals",
    description: "Template literals should not be nested",
    rationale: tslint.Utils.dedent``,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-4624",
    type: "maintainability",
    typescriptOnly: false,
  };

  public static MESSAGE = "Extract this template literal into a dedicated statement.";

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName).visit(sourceFile).getIssues();
  }
}

class Visitor extends SonarRuleVisitor {
  public visitTemplateExpression(node: ts.TemplateExpression) {
    this.checkNestedTemplate(node);
    super.visitTemplateExpression(node);
  }

  public visitNoSubstitionTemplateLiteral(node: ts.NoSubstitutionTemplateLiteral) {
    this.checkNestedTemplate(node);
    super.visitNoSubstitionTemplateLiteral(node);
  }

  private checkNestedTemplate(node: ts.TemplateLiteral) {
    const parentTemplate = ancestorsChain(node).find(parent => is(parent, ts.SyntaxKind.TemplateExpression));
    if (parentTemplate) {
      this.addIssue(node, Rule.MESSAGE);
    }
  }
}
