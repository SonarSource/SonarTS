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
    ruleName: "use-primitive-type",
    description: "Wrapper objects should not be used for primitive types",
    rationale: tslint.Utils.dedent`
      The use of wrapper objects for primitive types is gratuitous, confusing and dangerous. If you use a wrapper 
      object constructor for type conversion, just remove the new keyword, and you'll get a primitive value 
      automatically. If you use a wrapper object as a way to add properties to a primitive, you should re-think the 
      design. Such uses are considered bad practice, and should be refactored. Finally, this rule reports usages of 
      wrapper objects in type declaration section.`,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-1533",
    type: "functionality",
    typescriptOnly: true,
  };

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends tslint.RuleWalker {
  protected visitNode(node: ts.Node) {
    // TODO create and use `visitTypeNode` in visitor
    if (ts.isTypeNode(node)) {
      const text = node.getText();
      if (this.isPrimitiveWrapper(text)) {
        this.addFailureAtNode(
          node,
          `Replace this '${text}' wrapper object with primitive type '${text.toLowerCase()}'.`,
        );
      }
    }
    super.visitNode(node);
  }

  protected visitNewExpression(node: ts.NewExpression) {
    if (ts.isIdentifier(node.expression) && this.isPrimitiveWrapper(node.expression.text)) {
      this.addFailureAtNode(node, `Remove this use of '${node.expression.text}' constructor.`);
    }
    super.visitNewExpression(node);
  }

  private isPrimitiveWrapper(name: string) {
    return ["Number", "String", "Boolean"].includes(name);
  }
}
