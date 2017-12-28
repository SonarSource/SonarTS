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
import { RuleFailure } from "tslint";
import { SonarRuleMetaData } from "../sonarRule";
import { is } from "../utils/navigation";
import { nodeToSonarLine } from "../runner/sonar-utils";
import { TypedSonarRuleVisitor } from "../utils/sonar-analysis";

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "use-type-alias",
    description: "Type aliases should be used",
    rationale: tslint.Utils.dedent`
      Union and intersection types are very convenient but can make code a bit harder to read and to maintain. So if a 
      particular union or intersection is used in multiple places it is highly recommended to use a type alias.`,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-4323",
    type: "functionality",
    typescriptOnly: true,
  };

  public static NUMBER_OF_TYPES_THRESHOLD = 3;
  public static REPEATED_USAGE_THRESHOLD = 3;

  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    return new Visitor(this.getOptions().ruleName, program).visit(sourceFile).getIssues();
  }
}

class Visitor extends TypedSonarRuleVisitor {
  private unionOrIntersectionTypeUsage: Map<ts.Type, ts.TypeNode[]> = new Map();

  protected visitNode(node: ts.Node): void {
    if (is(node, ts.SyntaxKind.UnionType, ts.SyntaxKind.IntersectionType)) {
      const typeNode = node as ts.UnionOrIntersectionTypeNode;
      const type = this.program.getTypeChecker().getTypeFromTypeNode(typeNode);

      // number of types is determined from AST node, because real type will resolve type aliases
      if (isUnionOrIntersectionType(type) && typeNode.types.length >= Rule.NUMBER_OF_TYPES_THRESHOLD) {
        let typeUsages = this.unionOrIntersectionTypeUsage.get(type);
        if (!typeUsages) {
          typeUsages = [typeNode];
          this.unionOrIntersectionTypeUsage.set(type, typeUsages);
        } else {
          typeUsages.push(typeNode);
        }
        if (typeUsages.length === Rule.REPEATED_USAGE_THRESHOLD) {
          const lines = typeUsages.map(u => nodeToSonarLine(u));
          lines.shift();
          this.addIssue(typeUsages[0], Visitor.message(type, lines));
        }
      }
    }
    super.visitNode(node);
  }

  protected visitTypeAliasDeclaration(_: ts.TypeAliasDeclaration): void {
    // cut the visit
  }

  private static message(type: ts.Type, alsoUsed: number[]) {
    const uniqueLines = Array.from(new Set(alsoUsed)).sort((a, b) => a - b);
    const lines = uniqueLines.length > 1 ? ` It is also used on lines ${uniqueLines}.` : "";
    const typeKind = type.flags & ts.TypeFlags.Union ? "union" : "intersection";
    return `Replace this ${typeKind} type with a type alias.${lines}`;
  }
}

function isUnionOrIntersectionType(type: ts.Type): type is ts.UnionOrIntersectionType {
  return !!(type.flags & ts.TypeFlags.UnionOrIntersection);
}
