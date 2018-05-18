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
import { TypedSonarRuleVisitor } from "../utils/sonarAnalysis";
import { is, isLiteralExpression, isSignatureDeclaration } from "../utils/nodes";

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "consecutive-overloads",
    description: "Method overloads should be grouped together",
    rationale: tslint.Utils.dedent``,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-4136",
    type: "maintainability",
    typescriptOnly: true,
  };

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName, program).visit(sourceFile).getIssues();
  }
}

class Visitor extends TypedSonarRuleVisitor {
  protected visitTypeLiteral(node: ts.TypeLiteralNode): void {
    this.checkOverloads(node.members);
    super.visitTypeLiteral(node);
  }

  protected visitInterfaceDeclaration(node: ts.InterfaceDeclaration): void {
    this.checkOverloads(node.members);
    super.visitInterfaceDeclaration(node);
  }

  protected visitClassDeclaration(node: ts.ClassDeclaration): void {
    this.checkOverloads(node.members);
    super.visitClassDeclaration(node);
  }

  protected visitModuleDeclaration(node: ts.ModuleDeclaration): void {
    const moduleBody = node.body;
    if (is(moduleBody, ts.SyntaxKind.ModuleBlock)) {
      const functionLike = (moduleBody as ts.ModuleBlock).statements.filter(stmt => isSignatureDeclaration(stmt));
      this.checkOverloads(functionLike);
    }
    super.visitModuleDeclaration(node);
  }

  protected visitSourceFile(node: ts.SourceFile): void {
    this.checkOverloads(node.statements.filter(stmt => isSignatureDeclaration(stmt)));
    super.visitSourceFile(node);
  }

  private checkOverloads(nodes: ReadonlyArray<ts.Node>) {
    const misplacedOverloads = getMisplacedOverloads(nodes);
    for (const [first, ...rest] of misplacedOverloads.values()) {
      if (rest.length > 0) {
        const issue = this.addIssue(first, `All '${printOverload(first)}' signatures should be adjacent`);
        rest.forEach(n => issue.addSecondaryLocation(n, "Non-adjacent overload"));
      }
    }
  }
}

function getMisplacedOverloads(overloads: ReadonlyArray<ts.Node>) {
  const result = new Map<string, ts.Node[]>();
  let lastKey: string | undefined;
  for (const node of overloads) {
    if (node.kind === ts.SyntaxKind.SemicolonClassElement || isAccessor(node)) {
      continue;
    }

    const key = getOverloadKey(node);
    if (key !== undefined) {
      const overloads = result.get(key);
      if (overloads && lastKey !== key) {
        overloads.push(node);
      }
      if (overloads === undefined) {
        result.set(key, [node]);
      }
      lastKey = key;
    } else {
      lastKey = undefined;
    }
  }
  return result;
}

function isAccessor(member: ts.Node): boolean {
  return member.kind === ts.SyntaxKind.GetAccessor || member.kind === ts.SyntaxKind.SetAccessor;
}

function printOverload(node: ts.Node): string {
  const info = getOverloadInfo(node);
  return typeof info === "string" ? info : info === undefined ? "<unknown>" : info.name;
}

function getOverloadKey(node: ts.Node): string | undefined {
  const info = getOverloadInfo(node);
  if (info === undefined) {
    return undefined;
  }

  const [computed, name] = typeof info === "string" ? [false, info] : [info.computed, info.name];
  const isStatic = node.modifiers && node.modifiers.map(m => m.kind).indexOf(ts.SyntaxKind.StaticKeyword) !== -1;
  return (computed ? "0" : "1") + (isStatic ? "0" : "1") + name;
}

function getOverloadInfo(node: ts.Node): string | { name: string; computed?: boolean } | undefined {
  switch (node.kind) {
    case ts.SyntaxKind.ConstructSignature:
    case ts.SyntaxKind.Constructor:
      return "constructor";
    case ts.SyntaxKind.CallSignature:
      return "()";
    default: {
      if (!isSignatureDeclaration(node) || node.name === undefined) {
        return undefined;
      }
      const { name } = node;

      switch (name.kind) {
        case ts.SyntaxKind.Identifier:
          return name.text;
        case ts.SyntaxKind.ComputedPropertyName:
          const { expression } = name;
          return isLiteralExpression(expression) ? expression.text : { name: expression.getText(), computed: true };
        default:
          return isLiteralExpression(name) ? name.text : undefined;
      }
    }
  }
}
