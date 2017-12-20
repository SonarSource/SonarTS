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
import { isIntersectionTypeNode } from "../utils/navigation";

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-impossible-intersection",
    description: "Type intersections should not be empty",
    rationale: tslint.Utils.dedent`
      An intersection type combines multiple types into one. This allows you to add together existing types to get a 
      single type that has all the features you need. However if the combined types are mutually exclusive, then the 
      intersection is empty and no type can match it. This is almost certainly an error.`,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-4335",
    type: "functionality",
    typescriptOnly: false,
  };

  public static MESSAGE = "Change this type declaration to a non-empty intersection.";

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions(), program));
  }
}

class Walker extends tslint.ProgramAwareRuleWalker {
  protected visitNode(node: ts.Node) {
    if (isIntersectionTypeNode(node)) {
      if (this.isSpoiledIntersection(node) || this.isPrimitiveIntersection(node)) {
        this.addFailureAtNode(node, Rule.MESSAGE);
      }
    }

    super.visitNode(node);
  }

  private isSpoiledIntersection(node: ts.IntersectionTypeNode) {
    const typeChecker = this.getProgram().getTypeChecker();
    return Array.from(node.types).some(typeNode => spoilIntersection(typeChecker.getTypeFromTypeNode(typeNode)));
  }

  private isPrimitiveIntersection(node: ts.IntersectionTypeNode) {
    const typeChecker = this.getProgram().getTypeChecker();
    return Array.from(node.types).every(typeNode => isPrimitiveType(typeChecker.getTypeFromTypeNode(typeNode)));
  }
}

function spoilIntersection({ flags }: ts.Type) {
  return Boolean(
    flags & ts.TypeFlags.Undefined ||
      flags & ts.TypeFlags.Null ||
      flags & ts.TypeFlags.Void ||
      flags & ts.TypeFlags.Never,
  );
}

function isPrimitiveType({ flags }: ts.Type) {
  return Boolean(
    flags & ts.TypeFlags.NumberLike || flags & ts.TypeFlags.StringLike || flags & ts.TypeFlags.BooleanLike,
  );
}
