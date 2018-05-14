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
import areEquivalent from "../utils/areEquivalent";

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-duplicate-in-composite",
    description: "Composite types should not be defined with duplicated elements",
    rationale: tslint.Utils.dedent``,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-4621",
    type: "maintainability",
    typescriptOnly: false,
  };

  public static MESSAGE = "Remove this duplicated type.";

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName).visit(sourceFile).getIssues();
  }
}

class Visitor extends SonarRuleVisitor {
  public visitIntersectionTypeNode(node: ts.IntersectionTypeNode) {
    this.checkDuplication(node);
    super.visitIntersectionTypeNode(node);
  }

  public visitUnionTypeNode(node: ts.UnionTypeNode) {
    this.checkDuplication(node);
    super.visitUnionTypeNode(node);
  }

  private checkDuplication(node: ts.UnionOrIntersectionTypeNode) {
    const alreadyVisited: { [index: number]: boolean } = {};
    node.types.forEach((currentType, currentIndex) => {
      alreadyVisited[currentIndex] = true;
      const duplicateTypes: ts.TypeNode[] = [];
      node.types.forEach((type, index) => {
        if (index !== currentIndex && !alreadyVisited[index] && areEquivalent(type, currentType)) {
          alreadyVisited[index] = true;
          duplicateTypes.push(type);
        }
      });
      if (duplicateTypes.length > 0) {
        const issue = this.addIssue(duplicateTypes[0], Rule.MESSAGE);
        duplicateTypes.slice(1).forEach(type => issue.addSecondaryLocation(type));
      }
    });
  }
}
