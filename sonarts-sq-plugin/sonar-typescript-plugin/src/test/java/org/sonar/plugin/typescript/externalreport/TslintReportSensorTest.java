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
import java.util.Collection;
import java.util.Iterator;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.sonar.api.SonarQubeSide;
import org.sonar.api.SonarRuntime;
import org.sonar.api.batch.rule.Severity;
import org.sonar.api.batch.sensor.internal.DefaultSensorDescriptor;
import org.sonar.api.batch.sensor.internal.SensorContextTester;
import org.sonar.api.batch.sensor.issue.ExternalIssue;
import org.sonar.api.config.internal.MapSettings;
import org.sonar.api.internal.SonarRuntimeImpl;
import org.sonar.api.rules.RuleType;
import org.sonar.api.utils.Version;
import org.sonar.api.utils.log.LogTester;
import org.sonar.api.utils.log.LoggerLevel;
import org.sonar.plugin.typescript.TypeScriptLanguage;
import org.sonar.plugin.typescript.TypeScriptPlugin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.sonar.plugin.typescript.TestUtils.createInputFile;

public class TslintReportSensorTest {

  @Rule
  public final LogTester logTester = new LogTester();

  private static final File BASE_DIR = new File("src/test/resources/externalIssues/").getAbsoluteFile();
  private static final String CONTENT = "foo('aaaaaaa')\nif (cond) \n{ }";

  private SensorContextTester context = SensorContextTester.create(BASE_DIR);
  private TslintReportSensor tslintReportSensor = new TslintReportSensor();

  @Before
  public void setUp() throws Exception {
    context.setRuntime(getRuntime(7, 2));
    context.fileSystem().add(createInputFile(context, CONTENT, "myFile.ts"));
  }

  @Test
  public void should_add_issues_from_report() throws Exception {
    setTslintReport("tslint-report.json");
    tslintReportSensor.execute(context);

    Collection<ExternalIssue> externalIssues = context.allExternalIssues();
    assertThat(externalIssues).hasSize(2);
    Iterator<ExternalIssue> iterator = externalIssues.iterator();
    ExternalIssue first = iterator.next();
    ExternalIssue second = iterator.next();

    assertThat(first.type()).isEqualTo(RuleType.CODE_SMELL);
    assertThat(second.type()).isEqualTo(RuleType.BUG);

    assertThat(first.remediationEffort()).isEqualTo(5);
    assertThat(first.severity()).isEqualTo(Severity.MAJOR);
    assertThat(first.primaryLocation().message()).isEqualTo("Missing semicolon");
    assertThat(first.primaryLocation().textRange().start().line()).isEqualTo(1);
  }

  @Test
  public void should_ignore_report_on_older_sonarqube() throws Exception {
    context.setRuntime(getRuntime(7, 1));
    setTslintReport("tslint-report.json");
    tslintReportSensor.execute(context);

    assertThat(context.allExternalIssues()).isEmpty();
    assertThat(logTester.logs(LoggerLevel.ERROR)).contains("Current version of SonarQube doesn't support import of external issues (at least 7.2 required).");
  }

  @Test
  public void should_do_nothing_when_no_report() throws Exception {
    setTslintReport("");
    tslintReportSensor.execute(context);

    assertThat(context.allExternalIssues()).isEmpty();
  }

  @Test
  public void should_log_when_not_existing_report_file() throws Exception {
    setTslintReport("not-exist.json");
    tslintReportSensor.execute(context);

    assertThat(context.allExternalIssues()).isEmpty();
    assertThat(logTester.logs(LoggerLevel.ERROR)).contains("No TSLint issues information will be saved because file cannot be found.");
  }

  @Test
  public void should_log_when_not_found_input_file() throws Exception {
    setTslintReport("invalid-ts-file.json");
    tslintReportSensor.execute(context);

    assertThat(context.allExternalIssues()).hasSize(1);
    assertThat(logTester.logs(LoggerLevel.WARN)).contains("No input file found for not-exist.ts. No TSLint issues will be imported on this file.");
  }

  @Test
  public void should_accept_absolute_path_to_report() throws Exception {
    setTslintReport(new File(BASE_DIR, "tslint-report.json").getAbsolutePath());
    tslintReportSensor.execute(context);
    assertThat(context.allExternalIssues()).hasSize(2);
  }

  @Test
  public void should_accept_several_reports() throws Exception {
    setTslintReport("tslint-report.json, invalid-ts-file.json");
    tslintReportSensor.execute(context);
    assertThat(context.allExternalIssues()).hasSize(3);
  }

  @Test
  public void test_descriptor() throws Exception {
    DefaultSensorDescriptor sensorDescriptor = new DefaultSensorDescriptor();
    tslintReportSensor.describe(sensorDescriptor);
    assertThat(sensorDescriptor.name()).isEqualTo("Import of TSLint issues");
    assertThat(sensorDescriptor.languages()).containsOnly(TypeScriptLanguage.KEY);
  }

  private void setTslintReport(String reportFileName) {
    MapSettings settings = new MapSettings();
    settings.setProperty(TypeScriptPlugin.TSLINT_REPORT_PATHS, reportFileName);
    context.setSettings(settings);
  }

  private SonarRuntime getRuntime(int major, int minor) {
    return SonarRuntimeImpl.forSonarQube(Version.create(major, minor), SonarQubeSide.SERVER);
  }
}
