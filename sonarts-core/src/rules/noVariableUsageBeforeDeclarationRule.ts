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

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-variable-usage-before-declaration",
    description: "Variables should be declared before they are used",
    rationale: tslint.Utils.dedent`
      One of the biggest sources of confusion for JavaScript beginners is scoping. The reason
      scoping is so confusing in JavaScript is because JavaScript looks like a C-family language
      but doesn't act like one. C-family languages have block-level scope, meaning that when
      control enters a block, such as an if statement, new variables can be declared within that
      scope without affecting the outer scope. However, this is not the case in JavaScript.
      To minimize confusion as much as possible, variables should always be declared before
      they are used.`,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-1526",
    type: "functionality",
    typescriptOnly: false,
  };

  public static formatMessage(variable: string) {
    return `Move the declaration of "${variable}" before this usage.`;
  }

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk(program));
  }
}

function walk(program: ts.Program) {
  return (context: tslint.WalkContext<void>) => {
    const declarations = collectDeclarations(context.sourceFile, program);
    const usages = collectUsages(context.sourceFile, program);

    usages.forEach((usage, symbol) => {
      const declaration = declarations.get(symbol);
      if (declaration) {
        const usageLine = getLine(usage, context.sourceFile);
        const declarationLine = getLine(declaration, context.sourceFile);
        if (usageLine < declarationLine) {
          context.addFailureAtNode(usage, Rule.formatMessage(usage.text));
        }
      }
    });
  };
}

/*
 * Return the top most declaration for each symbol
 */
function collectDeclarations(sourceFile: ts.SourceFile, program: ts.Program): Map<ts.Symbol, ts.VariableDeclaration> {
  const results = new Map();
  visitNode(sourceFile);
  return results;

  function visitNode(node: ts.Node): void {
    if (node.kind >= ts.SyntaxKind.FirstTypeNode && node.kind <= ts.SyntaxKind.LastTypeNode) {
      return;
    }

    if (isVariableDeclarationList(node) && isVar(node)) {
      node.declarations.forEach(process);
    }

    ts.forEachChild(node, visitNode);
  }

  function process(declaration: ts.VariableDeclaration) {
    const symbol = getSymbol(declaration.name, program);
    const line = getLine(declaration, sourceFile);
    const previous = results.get(symbol);
    if (previous == null || getLine(previous, sourceFile) > line) {
      results.set(symbol, declaration);
    }
  }
}

/*
 * Return the top most usage for each symbol
 */
function collectUsages(sourceFile: ts.SourceFile, program: ts.Program): Map<ts.Symbol, ts.Identifier> {
  const results = new Map();
  visitNode(sourceFile);
  return results;

  function visitNode(node: ts.Node): void {
    if (node.kind >= ts.SyntaxKind.FirstTypeNode && node.kind <= ts.SyntaxKind.LastTypeNode) {
      return;
    }

    if (isIdentifier(node)) {
      process(node);
    }

    ts.forEachChild(node, visitNode);
  }

  function process(node: ts.Identifier) {
    const symbol = getSymbol(node, program);
    const line = getLine(node, sourceFile);
    const previous = results.get(symbol);
    if (previous == null || getLine(previous, sourceFile) > line) {
      results.set(symbol, node);
    }
  }
}

function isVariableDeclarationList(node: ts.Node): node is ts.VariableDeclarationList {
  return node.kind === ts.SyntaxKind.VariableDeclarationList;
}

function isVar(node: ts.VariableDeclarationList): boolean {
  return (node.flags & ts.NodeFlags.Let) === 0 && (node.flags & ts.NodeFlags.Const) === 0;
}

function getLine(node: ts.Node, sourceFile: ts.SourceFile): number {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line;
}

function isIdentifier(node: ts.Node): node is ts.Identifier {
  return node.kind === ts.SyntaxKind.Identifier;
}

function getSymbol(node: ts.Node, program: ts.Program): ts.Symbol | undefined {
  return program.getTypeChecker().getSymbolAtLocation(node);
}
