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

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import org.sonar.api.batch.fs.InputFile;
import org.sonar.api.batch.fs.TextRange;
import org.sonar.api.batch.rule.CheckFactory;
import org.sonar.api.batch.sensor.SensorContext;
import org.sonar.api.batch.sensor.issue.NewExternalIssue;
import org.sonar.api.batch.sensor.issue.NewIssueLocation;
import org.sonar.api.rule.RuleKey;
import org.sonar.api.server.rule.RulesDefinition.Context;
import org.sonar.api.utils.log.Logger;
import org.sonar.api.utils.log.Loggers;
import org.sonar.plugin.typescript.TypeScriptRules;

import static org.sonar.plugin.typescript.TypeScriptPlugin.TSLINT_REPORT_PATHS;

public class TslintReportSensor extends AbstractReportSensor {

  private static final Logger LOG = Loggers.get(TslintReportSensor.class);

  // key - tslint key, value - SQ key
  private final Map<String, String> activatedRules = new HashMap<>();

  private static final Set<String> BUG_TSLINT_RULES = new HashSet<>(Arrays.asList(
    "await-promise",
    "ban-comma-operator",
    "ban",
    "curly",
    "forin",
    "import-blacklist",
    "label-position",
    "no-arg",
    "no-bitwise",
    "no-conditional-assignment",
    "no-console",
    "no-construct",
    "no-debugger",
    "no-duplicate-super",
    "no-duplicate-switch-case",
    "no-duplicate-variable",
    "no-dynamic-delete",
    "no-empty",
    "no-eval",
    "no-floating-promises",
    "no-for-in-array",
    "no-implicit-dependencies",
    "no-inferred-empty-object-type",
    "no-invalid-template-strings",
    "no-invalid-this",
    "no-misused-new",
    "no-null-keyword",
    "no-object-literal-type-assertion",
    "no-return-await",
    "no-shadowed-variable",
    "no-sparse-arrays",
    "no-string-literal",
    "no-string-throw",
    "no-submodule-imports",
    "no-switch-case-fall-through",
    "no-this-assignment",
    "no-unbound-method",
    "no-unnecessary-class",
    "no-unsafe-any",
    "no-unsafe-finally",
    "no-unused-expression",
    "no-unused-variable",
    "no-use-before-declare",
    "no-var-keyword",
    "no-void-expression",
    "prefer-conditional-expression",
    "prefer-object-spread",
    "radix",
    "restrict-plus-operands",
    "strict-boolean-expressions",
    "strict-type-predicates",
    "switch-default",
    "triple-equals",
    "typeof-compare",
    "use-default-type-parameter",
    "use-isnan"));

  private static final String REPOSITORY = "tslint";

  public TslintReportSensor(CheckFactory checkFactory) {
    TypeScriptRules typeScriptRules = new TypeScriptRules(checkFactory);
    typeScriptRules.forEach(typeScriptRule -> {
      if (typeScriptRule.isEnabled()) {
        String tsLintKey = typeScriptRule.tsLintKey();
        activatedRules.put(tsLintKey, typeScriptRules.ruleKeyFromTsLintKey(tsLintKey).toString());
      }
    });
  }

  @Override
  void importReport(File report, SensorContext context) {
    LOG.info("Importing {}", report.getAbsoluteFile());

    try (InputStreamReader inputStreamReader = new InputStreamReader(new FileInputStream(report), StandardCharsets.UTF_8)) {
      TslintError[] tslintErrors = gson.fromJson(inputStreamReader, TslintError[].class);
      for (TslintError tslintError : tslintErrors) {
        saveTslintError(context, tslintError);
      }
    } catch (IOException e) {
      LOG.error(FILE_EXCEPTION_MESSAGE, e);
    }
  }

  private void saveTslintError(SensorContext context, TslintError tslintError) {
    String tslintKey = tslintError.ruleName;

    if (activatedRules.containsKey(tslintKey)) {
      String message = "TSLint issue for rule '{}' is skipped because this rule is activated in your SonarQube profile for TypeScript (rule key in SQ {})";
      LOG.debug(message, tslintKey, activatedRules.get(tslintKey));
      return;
    }

    InputFile inputFile = getInputFile(context, tslintError.name);
    if (inputFile == null) {
      return;
    }
    NewExternalIssue newExternalIssue = context.newExternalIssue();

    NewIssueLocation primaryLocation = newExternalIssue.newLocation()
      .message(tslintError.failure)
      .on(inputFile)
      .at(getLocation(tslintError, inputFile));

    newExternalIssue
      .at(primaryLocation)
      .forRule(RuleKey.of(REPOSITORY, tslintKey))
      .type(ruleType(tslintKey))
      .severity(DEFAULT_SEVERITY)
      .remediationEffortMinutes(DEFAULT_REMEDIATION_COST)
      .save();
  }

  private static TextRange getLocation(TslintError tslintError, InputFile inputFile) {
    if (samePosition(tslintError.startPosition, tslintError.endPosition)) {
      // tslint allows issue location with 0 length, SonarQube doesn't allow that
      return inputFile.selectLine(tslintError.startPosition.line + 1);
    } else {
      return inputFile.newRange(
        tslintError.startPosition.line + 1,
        tslintError.startPosition.character,
        tslintError.endPosition.line + 1,
        tslintError.endPosition.character);
    }
  }

  private static boolean samePosition(TslintPosition p1, TslintPosition p2) {
    return p1.line == p2.line && p1.character == p2.character;
  }

  @Override
  String linterName() {
    return "TSLint";
  }

  @Override
  Set<String> bugRuleKeys() {
    return BUG_TSLINT_RULES;
  }

  @Override
  String reportsPropertyName() {
    return TSLINT_REPORT_PATHS;
  }

  public static void createExternalRuleRepository(Context context) {
    createExternalRuleRepository(context, REPOSITORY, "TSLint", BUG_TSLINT_RULES);
  }

  private static class TslintError {
    TslintPosition startPosition;
    TslintPosition endPosition;
    String failure;
    String name;
    String ruleName;
  }

  private static class TslintPosition {
    int character;
    int line;
  }

}
