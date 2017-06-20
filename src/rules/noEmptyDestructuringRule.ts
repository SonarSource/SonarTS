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

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-empty-destructuring",
    description: "Destructuring patterns should not be empty",
    rationale: tslint.Utils.dedent`
      Destructuring is a convenient way of extracting multiple values from data stored in
      (possibly nested) objects and arrays. However, it is possible to create an empty pattern that
      has no effect. When empty curly braces or brackets are used to the right of a property name
      most of the time the intent was to use a default value instead.`,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-3799",
    type: "functionality",
    typescriptOnly: false,
  };

  public static formatMessage() {
    return "Change this pattern to not be empty.";
  }

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends tslint.RuleWalker {
  public visitBindingPattern(node: ts.BindingPattern) {
    if (node.elements.length === 0) {
      this.addFailureAtNode(node, Rule.formatMessage());
    }

    super.visitBindingPattern(node);
  }
}
