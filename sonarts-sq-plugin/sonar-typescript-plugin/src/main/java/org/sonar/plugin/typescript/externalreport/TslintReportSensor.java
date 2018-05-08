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

import com.google.gson.Gson;
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
import org.sonar.api.batch.fs.FilePredicates;
import org.sonar.api.batch.fs.InputFile;
import org.sonar.api.batch.fs.TextRange;
import org.sonar.api.batch.rule.CheckFactory;
import org.sonar.api.batch.rule.Severity;
import org.sonar.api.batch.sensor.Sensor;
import org.sonar.api.batch.sensor.SensorContext;
import org.sonar.api.batch.sensor.SensorDescriptor;
import org.sonar.api.batch.sensor.issue.NewExternalIssue;
import org.sonar.api.batch.sensor.issue.NewIssueLocation;
import org.sonar.api.rule.RuleKey;
import org.sonar.api.rules.RuleType;
import org.sonar.api.utils.Version;
import org.sonar.api.utils.log.Logger;
import org.sonar.api.utils.log.Loggers;
import org.sonar.plugin.typescript.TypeScriptLanguage;
import org.sonar.plugin.typescript.TypeScriptRules;

import static org.sonar.plugin.typescript.TypeScriptPlugin.TSLINT_REPORT_PATHS;

public class TslintReportSensor implements Sensor {

  private static final Logger LOG = Loggers.get(TslintReportSensor.class);
  private final Gson gson = new Gson();

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
  public void execute(SensorContext context) {
    boolean externalIssuesSupported = context.getSonarQubeVersion().isGreaterThanOrEqual(Version.create(7, 2));
    String[] tslintReportPaths = context.config().getStringArray(TSLINT_REPORT_PATHS);

    if (tslintReportPaths.length == 0) {
      return;
    }

    if (!externalIssuesSupported) {
      LOG.error("Import of external issues requires SonarQube 7.2 or greater.");
      return;
    }

    for (String reportPath : tslintReportPaths) {
      File tslintReport = getIOFile(context.fileSystem().baseDir(), reportPath);
      importTslintReport(tslintReport, context);
    }
  }

  private void importTslintReport(File report, SensorContext context) {
    LOG.info("Importing {}", report.getAbsoluteFile());

    try (InputStreamReader inputStreamReader = new InputStreamReader(new FileInputStream(report), StandardCharsets.UTF_8)) {
      TslintError[] tslintErrors = gson.fromJson(inputStreamReader, TslintError[].class);
      for (TslintError tslintError : tslintErrors) {
        saveTslintError(context, tslintError);
      }
    } catch (IOException e) {
      LOG.error("No TSLint issues information will be saved as the report file can't be read.", e);
    }
  }

  private void saveTslintError(SensorContext context, TslintError tslintError) {
    String tslintKey = tslintError.ruleName;

    if (activatedRules.containsKey(tslintKey)) {
      String message = "TSLint issue for rule '{}' is skipped because this rule is activated in your SonarQube profile for TypeScript (rule key in SQ {})";
      LOG.debug(message, tslintKey, activatedRules.get(tslintKey));
      return;
    }

    FilePredicates predicates = context.fileSystem().predicates();
    InputFile inputFile = context.fileSystem().inputFile(predicates.or(predicates.hasRelativePath(tslintError.name), predicates.hasAbsolutePath(tslintError.name)));
    if (inputFile == null) {
      LOG.warn("No input file found for " + tslintError.name + ". No TSLint issues will be imported on this file.");
      return;
    }
    NewExternalIssue newExternalIssue = context.newExternalIssue();

    NewIssueLocation primaryLocation = newExternalIssue.newLocation()
      .message(tslintError.failure)
      .on(inputFile)
      .at(getLocation(tslintError, inputFile));

    newExternalIssue
      .at(primaryLocation)
      .forRule(RuleKey.of("tslint", tslintKey))
      .type(BUG_TSLINT_RULES.contains(tslintKey) ? RuleType.BUG : RuleType.CODE_SMELL)
      .severity(Severity.MAJOR)
      .remediationEffortMinutes(5L)
      .save();
  }

  private static TextRange getLocation(TslintError tslintError, InputFile inputFile) {
    TextRange location;
    if (samePosition(tslintError.startPosition, tslintError.endPosition)) {
      // tslint allows issue location with 0 length, SonarQube doesn't allow that
      location = inputFile.selectLine(tslintError.startPosition.line + 1);
    } else {
      location = inputFile.newRange(
        tslintError.startPosition.line + 1,
        tslintError.startPosition.character,
        tslintError.endPosition.line + 1,
        tslintError.endPosition.character);
    }
    return location;
  }

  private static boolean samePosition(TslintPosition p1, TslintPosition p2) {
    return p1.line == p2.line && p1.character == p2.character;
  }

  /**
   * Returns a java.io.File for the given path.
   * If path is not absolute, returns a File with module base directory as parent path.
   */
  private static File getIOFile(File baseDir, String path) {
    File file = new File(path);
    if (!file.isAbsolute()) {
      file = new File(baseDir, path);
    }

    return file;
  }

  @Override
  public void describe(SensorDescriptor sensorDescriptor) {
    sensorDescriptor
      .onlyOnLanguage(TypeScriptLanguage.KEY)
      .name("Import of TSLint issues");
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
