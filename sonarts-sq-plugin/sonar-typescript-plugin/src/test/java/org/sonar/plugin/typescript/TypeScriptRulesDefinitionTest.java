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
package org.sonar.plugin.typescript;

import org.junit.Test;
import org.sonar.api.rules.RuleType;
import org.sonar.api.server.debt.DebtRemediationFunction.Type;
import org.sonar.api.server.rule.RulesDefinition;
import org.sonar.api.server.rule.RulesDefinition.Param;
import org.sonar.api.server.rule.RulesDefinition.Repository;
import org.sonar.api.server.rule.RulesDefinition.Rule;

import static org.assertj.core.api.Assertions.assertThat;

public class TypeScriptRulesDefinitionTest {

  @Test
  public void test() {
    TypeScriptRulesDefinition rulesDefinition = new TypeScriptRulesDefinition(false);
    RulesDefinition.Context context = new RulesDefinition.Context();
    rulesDefinition.define(context);
    RulesDefinition.Repository repository = context.repository("typescript");

    assertThat(context.repositories()).hasSize(1);

    assertThat(repository.name()).isEqualTo("SonarAnalyzer");
    assertThat(repository.language()).isEqualTo("ts");
    assertThat(repository.isExternal()).isEqualTo(false);
    assertThat(repository.rules()).hasSize(TypeScriptRules.getRuleClasses().size());

    assertRuleProperties(repository);
    assertAllRuleParametersHaveDescription(repository);
  }


  @Test
  public void test_external_repositories() {
    TypeScriptRulesDefinition rulesDefinition = new TypeScriptRulesDefinition(true);
    RulesDefinition.Context context = new RulesDefinition.Context();
    rulesDefinition.define(context);
    RulesDefinition.Repository tslintRepository = context.repository("external_tslint");
    RulesDefinition.Repository eslintRepository = context.repository("external_eslint");

    assertThat(context.repositories()).hasSize(3);

    assertThat(tslintRepository.name()).isEqualTo("TSLint");
    assertThat(eslintRepository.name()).isEqualTo("ESLint");

    assertThat(tslintRepository.language()).isEqualTo("ts");
    assertThat(tslintRepository.isExternal()).isEqualTo(true);

    assertThat(tslintRepository.rules().size()).isEqualTo(144);
    assertThat(eslintRepository.rules().size()).isEqualTo(257);
  }

  private void assertRuleProperties(Repository repository) {
    Rule rule = repository.rule("S3923");
    assertThat(rule).isNotNull();
    assertThat(rule.name()).isEqualTo("All branches in a conditional structure should not have exactly the same implementation");
    assertThat(rule.debtRemediationFunction().type()).isEqualTo(Type.CONSTANT_ISSUE);
    assertThat(rule.type()).isEqualTo(RuleType.BUG);
  }

  private void assertAllRuleParametersHaveDescription(Repository repository) {
    for (Rule rule : repository.rules()) {
      for (Param param : rule.params()) {
        assertThat(param.description()).as("description for " + param.key()).isNotEmpty();
      }
    }
  }

}
