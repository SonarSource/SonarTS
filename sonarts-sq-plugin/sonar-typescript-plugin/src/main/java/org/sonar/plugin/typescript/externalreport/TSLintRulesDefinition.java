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
package org.sonar.plugin.typescript.externalreport;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.sonar.api.rules.RuleType;
import org.sonar.api.server.rule.RulesDefinition;
import org.sonar.plugin.typescript.TypeScriptLanguage;
import org.sonarsource.analyzer.commons.ExternalRuleLoader;

public class TSLintRulesDefinition implements RulesDefinition {

  private static final String JSON_CLASSPATH = "org/sonar/l10n/typescript/rules/%s/rules.json";

  private static final List<ExternalRuleLoader> RULE_LOADERS = Arrays.asList(
    new ExternalRuleLoader(TslintReportSensor.REPOSITORY, "TSLint", String.format(JSON_CLASSPATH, "tslint"), TypeScriptLanguage.KEY),
    new ExternalRuleLoader(TslintReportSensor.REPOSITORY, "tslint-sonarts", String.format(JSON_CLASSPATH, "tslint-sonarts"), TypeScriptLanguage.KEY)
  );

  private static final Map<String, RuleType> RULE_TYPE_MAP = RULE_LOADERS.stream()
    .flatMap(loader -> loader.ruleKeys().stream().collect(Collectors.toMap(Function.identity(), loader::ruleType)).entrySet().stream())
    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

  @Override
  public void define(Context context) {
    RULE_LOADERS.forEach(ruleLoader -> ruleLoader.createExternalRuleRepository(context));
  }

  public static RuleType ruleType(String ruleKey) {
    return RULE_TYPE_MAP.getOrDefault(ruleKey, RuleType.CODE_SMELL);
  }

}
