/*
 * SonarTS
 * Copyright (C) 2017-2019 SonarSource SA
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
import { is, isUnionTypeNode } from "../utils/nodes";

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "prefer-optional",
    description: "Optional property declarations should use '?' syntax",
    rationale: tslint.Utils.dedent``,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-4782",
    type: "maintainability",
    typescriptOnly: true,
  };

  public static MESSAGE = "Consider using '?' syntax to declare this property instead of 'undefined' in its type.";
  public static REDUNDANT_UNDEFINED_MESSAGE = "Consider removing redundant 'undefined' type";
  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName).visit(sourceFile).getIssues();
  }
}

class Visitor extends SonarRuleVisitor {
  visitPropertySignature(node: ts.PropertySignature) {
    this.checkProperty(node);
    super.visitPropertySignature(node);
  }

  visitPropertyDeclaration(node: ts.PropertyDeclaration) {
    this.checkProperty(node);
    super.visitPropertyDeclaration(node);
  }

  private checkProperty(node: ts.PropertySignature | ts.PropertyDeclaration) {
    const type = node.type;
    if (type && isUnionTypeNode(type)) {
      const undefinedTypes = type.types.filter(t => is(t, ts.SyntaxKind.UndefinedKeyword));
      if (undefinedTypes.length > 0) {
        if (node.questionToken) {
          this.addIssue(undefinedTypes[0], Rule.REDUNDANT_UNDEFINED_MESSAGE);
        } else {
          this.addIssue(node.name, Rule.MESSAGE).addSecondaryLocation(undefinedTypes[0]);
        }
      }
    }
  }
}
