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
import { isFunctionDeclaration, isReturnStatement, isTryStatement } from "../utils/nodes";
import { isPromise } from "../utils/semantics";

const RETURN_LENGTH = "return".length;

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "prefer-return-await-in-try-block",
    description: "...", // todo
    rationale: tslint.Utils.dedent`....`, // todo
    optionsDescription: "Alternative promise constructors",
    options: {
      type: "array",
      items: { type: "string" },
    },
    rspecKey: "...", // todo
    type: "maintainability", // todo
    typescriptOnly: true,
  };

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    return new Walker(sourceFile, program, this.ruleArguments).startWalk();
  }
}

class Walker {
  private readonly issues: tslint.RuleFailure[] = [];

  constructor(private sourceFile: ts.SourceFile, private program: ts.Program, private customPromises?: string[]) {}

  public startWalk() {
    this.walk(this.sourceFile, false);
    return this.issues;
  }

  private walk(node: ts.Node, shouldWarnAboutReturn: boolean) {
    if (isTryStatement(node)) {
      if (node.catchClause) {
        this.walk(node.catchClause, shouldWarnAboutReturn);
      }
      if (node.finallyBlock) {
        this.walk(node.finallyBlock, shouldWarnAboutReturn);
      }

      for (const statement of node.tryBlock.statements) {
        this.walk(statement, true);
      }
      return;
    }

    const shouldChildWarnAboutReturn = shouldWarnAboutReturn && !isFunctionDeclaration(node);

    for (const child of node.getChildren()) {
      this.walk(child, shouldChildWarnAboutReturn);
    }

    // not handling () => promise because no try-catch block
    if (shouldWarnAboutReturn && isReturnStatement(node)) {
      if (node.expression && isPromise(node.expression, this.program.getTypeChecker(), this.customPromises)) {
        const start = node.getStart(this.sourceFile);

        this.issues.push(
          new tslint.RuleFailure(
            this.sourceFile,
            start,
            start + RETURN_LENGTH,
            "Possible missing await keyword after return",
            Rule.metadata.ruleName,
            new tslint.Replacement(start, RETURN_LENGTH, "return await"), // todo make function async?
          ),
        );
      }
    }
  }
}
