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
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import org.sonar.api.batch.fs.FilePredicates;
import org.sonar.api.batch.fs.InputFile;
import org.sonar.api.batch.rule.Severity;
import org.sonar.api.batch.sensor.Sensor;
import org.sonar.api.batch.sensor.SensorContext;
import org.sonar.api.batch.sensor.SensorDescriptor;
import org.sonar.api.rules.RuleType;
import org.sonar.api.server.rule.RulesDefinition.Context;
import org.sonar.api.server.rule.RulesDefinition.NewRepository;
import org.sonar.api.server.rule.RulesDefinition.NewRule;
import org.sonar.api.utils.Version;
import org.sonar.api.utils.log.Logger;
import org.sonar.api.utils.log.Loggers;
import org.sonar.plugin.typescript.TypeScriptLanguage;

public abstract class AbstractReportSensor implements Sensor {

  private static final Logger LOG = Loggers.get(AbstractReportSensor.class);
  protected static final Gson gson = new Gson();

  static final long DEFAULT_REMEDIATION_COST = 5L;
  static final Severity DEFAULT_SEVERITY = Severity.MAJOR;
  static final String FILE_EXCEPTION_MESSAGE = "No issues information will be saved as the report file can't be read.";

  @Override
  public void execute(SensorContext context) {
    boolean externalIssuesSupported = context.getSonarQubeVersion().isGreaterThanOrEqual(Version.create(7, 2));
    String[] reportPaths = context.config().getStringArray(reportsPropertyName());

    if (reportPaths.length == 0) {
      return;
    }

    if (!externalIssuesSupported) {
      LOG.error("Import of external issues requires SonarQube 7.2 or greater.");
      return;
    }

    for (String reportPath : reportPaths) {
      File report = getIOFile(context.fileSystem().baseDir(), reportPath);
      importReport(report, context);
    }
  }

  InputFile getInputFile(SensorContext context, String fileName) {
    FilePredicates predicates = context.fileSystem().predicates();
    InputFile inputFile = context.fileSystem().inputFile(predicates.or(predicates.hasRelativePath(fileName), predicates.hasAbsolutePath(fileName)));
    if (inputFile == null) {
      LOG.warn("No input file found for {}. No {} issues will be imported on this file.", fileName, linterName());
      return null;
    }
    return inputFile;
  }

  /**
   * Returns a java.io.File for the given path.
   * If path is not absolute, returns a File with module base directory as parent path.
   */
  static File getIOFile(File baseDir, String path) {
    File file = new File(path);
    if (!file.isAbsolute()) {
      file = new File(baseDir, path);
    }

    return file;
  }

  RuleType ruleType(String key) {
    return bugRuleKeys().contains(key) ? RuleType.BUG : RuleType.CODE_SMELL;
  }

  @Override
  public void describe(SensorDescriptor sensorDescriptor) {
    sensorDescriptor
      .onlyOnLanguage(TypeScriptLanguage.KEY)
      .onlyWhenConfiguration(conf -> conf.hasKey(reportsPropertyName()))
      .name("Import of " + linterName() + " issues");
  }

  static void createExternalRuleRepository(Context context, String repositoryKey, String repositoryName, Set<String> bugRules) {
    NewRepository externalRepo = context.createExternalRepository(repositoryKey, TypeScriptLanguage.KEY).setName(repositoryName);
    String pathToRulesMeta = "org/sonar/l10n/typescript/rules/" + repositoryKey + "/rules.json";
    String description = "See the description of %s rule <code>%s</code> at <a href=\"%s\">%s website</a>.";

    try (InputStreamReader inputStreamReader = new InputStreamReader(AbstractReportSensor.class.getClassLoader().getResourceAsStream(pathToRulesMeta), StandardCharsets.UTF_8)) {
      ExternalRule[] rules = gson.fromJson(inputStreamReader, ExternalRule[].class);
      for (ExternalRule rule : rules) {
        NewRule newRule = externalRepo.createRule(rule.name).setName(rule.description);
        newRule.setHtmlDescription(String.format(description, repositoryName, rule.name, rule.url, repositoryName));
        newRule.setDebtRemediationFunction(newRule.debtRemediationFunctions().constantPerIssue(DEFAULT_REMEDIATION_COST + "min"));
        if (bugRules.contains(rule.name)) {
          newRule.setType(RuleType.BUG);
        }
      }

    } catch (IOException e) {
      throw new IllegalStateException("Can't read resource: " + pathToRulesMeta, e);
    }

    externalRepo.done();
  }

  abstract String linterName();
  abstract Set<String> bugRuleKeys();
  abstract String reportsPropertyName();
  abstract void importReport(File report, SensorContext context);


  private static class ExternalRule {
    String url;
    String name;
    String description;
  }

}
