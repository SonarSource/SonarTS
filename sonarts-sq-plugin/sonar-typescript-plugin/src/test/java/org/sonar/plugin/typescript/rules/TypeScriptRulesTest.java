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
package org.sonar.plugin.typescript.rules;


import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Iterables;
import com.google.common.reflect.ClassPath;
import com.google.common.reflect.ClassPath.ClassInfo;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.Test;
import org.sonar.api.batch.rule.CheckFactory;
import org.sonar.api.batch.rule.Checks;
import org.sonar.plugin.typescript.TestActiveRules;
import org.sonar.plugin.typescript.TypeScriptRules;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Matchers.anyCollection;
import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class TypeScriptRulesTest {

  private static final Set<String> EXCLUDED = ImmutableSet.of(TypeScriptRule.class, TypeScriptRules.class, TestRule.class)
    .stream().map(Class::getSimpleName).collect(Collectors.toSet());

  @Test
  public void rule_class_count_should_match() throws Exception {
    ClassPath classPath = ClassPath.from(Thread.currentThread().getContextClassLoader());
    List<String> ruleClassesOnClassPath = classPath.getTopLevelClasses("org.sonar.plugin.typescript.rules").stream()
      .map(ClassInfo::getSimpleName)
      .filter(name -> !EXCLUDED.contains(name) && !name.endsWith("Test") && !name.equals("package-info"))
      .collect(Collectors.toList());
    assertThat(TypeScriptRules.getRuleClasses()).extracting(Class::getSimpleName).containsAll(ruleClassesOnClassPath);
  }

  @Test
  public void no_duplicated_classes() {
    List<Class<? extends TypeScriptRule>> ruleClasses = TypeScriptRules.getRuleClasses();
    assertThat((long) ruleClasses.size()).isEqualTo(ruleClasses.stream().distinct().count());
  }

  @Test
  public void rule_instances_should_be_created_for_configurable_rules() {
    TypeScriptRules rules = new TypeScriptRules(mockCheckFactory());
    TypeScriptRule rule = Iterables.getOnlyElement(Iterables.filter(rules, TypeScriptRule::isEnabled));
    assertThat(rule.tsLintKey()).isEqualTo("test-rule");
    assertThat(new Gson().toJson(rule.configuration())).isEqualTo("[\"test\",1,true,\"x\",[]]");
  }

  @Test
  public void tslint_key_should_match_class_name() {
    TypeScriptRules rules = new TypeScriptRules(mockCheckFactory());
    for (TypeScriptRule rule : rules) {
      assertThat(keyToClassName(rule.tsLintKey())).isEqualTo(rule.getClass().getSimpleName());
    }
  }

  private static String keyToClassName(String tsLintKey) {
    StringBuilder sb = new StringBuilder();
    boolean upper = true;
    for (char c : tsLintKey.toCharArray()) {
      if (c == '-') {
        upper = true;
      } else {
        sb.append(upper ? Character.toUpperCase(c) : c);
        upper = false;
      }
    }
    return sb.toString();
  }

  @Test
  public void no_active_rules_no_rule_enabled() {
    TypeScriptRules rules = new TypeScriptRules(new CheckFactory(new TestActiveRules()));
    assertThat(rules).hasSize(TypeScriptRules.getRuleClasses().size());
    assertThat(rules).allMatch(rule -> !rule.isEnabled());
  }

  @Test
  public void key_mapping_should_exist_when_enabled() {
    String noUnconditionalJumpKey = "S1751";
    TypeScriptRules rules = new TypeScriptRules(new CheckFactory(new TestActiveRules(noUnconditionalJumpKey)));
    assertThat(rules.ruleKeyFromTsLintKey(new NoUnconditionalJump().tsLintKey()).rule()).isEqualTo(noUnconditionalJumpKey);
  }

  @Test
  public void key_mapping_should_not_exist_when_disabled() {
    TypeScriptRules rules = new TypeScriptRules(new CheckFactory(new TestActiveRules()));
    for (TypeScriptRule rule : rules) {
      assertThatThrownBy(() -> rules.ruleKeyFromTsLintKey(rule.tsLintKey()))
        .isInstanceOf(IllegalStateException.class)
        .hasMessage("Unknown tslint rule or rule not enabled " + rule.tsLintKey());
    }
  }

  private CheckFactory mockCheckFactory() {
    Checks checks = mock(Checks.class);
    when(checks.addAnnotatedChecks((Iterable) anyCollection())).thenReturn(checks);
    TestRule testRule = new TestRule();
    when(checks.all()).thenReturn(Collections.singleton(testRule));
    CheckFactory checkFactory = mock(CheckFactory.class);
    when(checkFactory.create(anyString())).thenReturn(checks);
    return checkFactory;
  }

  private static class TestRule extends TypeScriptRule {
    @Override
    public JsonElement configuration() {
      return ruleConfiguration("test", 1, true, 'x', new JsonArray());
    }

    @Override
    public String tsLintKey() {
      return "test-rule";
    }
  }
}
