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
import java.util.HashSet;
import java.util.Set;
import org.sonar.api.batch.fs.InputFile;
import org.sonar.api.batch.fs.TextRange;
import org.sonar.api.batch.sensor.SensorContext;
import org.sonar.api.batch.sensor.issue.NewExternalIssue;
import org.sonar.api.batch.sensor.issue.NewIssueLocation;
import org.sonar.api.rule.RuleKey;
import org.sonar.api.utils.log.Logger;
import org.sonar.api.utils.log.Loggers;

import static org.sonar.plugin.typescript.TypeScriptPlugin.ESLINT_REPORT_PATHS;

public class EslintReportSensor extends AbstractReportSensor {

  private static final Logger LOG = Loggers.get(EslintReportSensor.class);

  private static final Set<String> BUG_ESLINT_RULES = new HashSet<>(Arrays.asList(
    "for-direction",
    "getter-return",
    "no-await-in-loop",
    "no-compare-neg-zero",
    "no-cond-assign",
    "no-console",
    "no-constant-condition",
    "no-control-regex",
    "no-debugger",
    "no-dupe-args",
    "no-dupe-keys",
    "no-duplicate-case",
    "no-empty",
    "no-empty-character-class",
    "no-ex-assign",
    "no-extra-boolean-cast",
    "no-extra-parens",
    "no-extra-semi",
    "no-func-assign",
    "no-inner-declarations",
    "no-invalid-regexp",
    "no-irregular-whitespace",
    "no-obj-calls",
    "no-prototype-builtins",
    "no-regex-spaces",
    "no-sparse-arrays",
    "no-template-curly-in-string",
    "no-unexpected-multiline",
    "no-unreachable",
    "no-unsafe-finally",
    "no-unsafe-negation",
    "use-isnan",
    "valid-jsdoc",
    "valid-typeof",
    "no-dupe-class-members",
    "no-new-symbol"));

  @Override
  void importReport(File report, SensorContext context) {
    LOG.info("Importing {}", report.getAbsoluteFile());

    try (InputStreamReader inputStreamReader = new InputStreamReader(new FileInputStream(report), StandardCharsets.UTF_8)) {
      FileWithMessages[] filesWithMessages = gson.fromJson(inputStreamReader, FileWithMessages[].class);
      for (FileWithMessages fileWithMessages : filesWithMessages) {
        InputFile inputFile = getInputFile(context, fileWithMessages.filePath);
        if (inputFile != null) {
          for (EslintError eslintError : fileWithMessages.messages) {
            saveEslintError(context, eslintError, inputFile);
          }
        }
      }
    } catch (IOException e) {
      LOG.error(FILE_EXCEPTION_MESSAGE, e);
    }
  }

  private void saveEslintError(SensorContext context, EslintError eslintError, InputFile inputFile) {
    String eslintKey = eslintError.ruleId;

    NewExternalIssue newExternalIssue = context.newExternalIssue();

    NewIssueLocation primaryLocation = newExternalIssue.newLocation()
      .message(eslintError.message)
      .on(inputFile)
      .at(getLocation(eslintError, inputFile));

    newExternalIssue
      .at(primaryLocation)
      .forRule(RuleKey.of("eslint", eslintKey))
      .type(ruleType(eslintKey))
      .severity(DEFAULT_SEVERITY)
      .remediationEffortMinutes(DEFAULT_REMEDIATION_COST)
      .save();
  }

  private static TextRange getLocation(EslintError eslintError, InputFile inputFile) {
    if (eslintError.endLine == 0) {
      // eslint can have issues only with start
      return inputFile.selectLine(eslintError.line);
    } else {
      return inputFile.newRange(
        eslintError.line,
        eslintError.column - 1,
        eslintError.endLine,
        eslintError.endColumn - 1);
    }
  }

  @Override
  String linterName() {
    return "ESLint";
  }

  @Override
  Set<String> bugRuleKeys() {
    return BUG_ESLINT_RULES;
  }

  @Override
  String reportsPropertyName() {
    return ESLINT_REPORT_PATHS;
  }

  private static class FileWithMessages {
    String filePath;
    EslintError[] messages;
  }

  private static class EslintError {
    String ruleId;
    String message;
    int line;
    int column;
    int endLine;
    int endColumn;
  }
}
