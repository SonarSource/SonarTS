/// <reference path="testCase_template.ts" />
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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.??See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA??02110-1301, USA.
 */
import * as tslint from "tslint";
import * as ts from "typescript";
import { SonarRuleMetaData } from "../sonarRule";

export class Rule extends tslint.Rules.TypedRule {
    public static metadata: SonarRuleMetaData = {
        ruleName: "___RULE_NAME_DASH___",
        description: '___RULE_TITLE___',
        rationale: tslint.Utils.dedent``,
        optionsDescription: "",
        options: null,
        rspecKey: "___RSPEC_KEY___",
        type: "functionality",
        typescriptOnly: ___IS_TYPESCRIPT_ONLY___,
    };

    public static MESSAGE = 'TODO: add messge';

    public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
        return this.applyWithWalker(new Walker(sourceFile, this.getOptions(), program));
    }
}

class Walker extends tslint.ProgramAwareRuleWalker {
    public visitNode(node: ts.Node) {

		// YOUR CODE GOES HERE

        super.visitNode(node);
    }

    private raiseIssue(node: ts.DeleteExpression) {
		// TODO:

        //if (condition) {
        //    this.addFailureAtNode(deleteKeyword, Rule.MESSAGE);
        //}
    }
}
