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
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.Iterator;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;
import org.sonar.api.SonarQubeSide;
import org.sonar.api.SonarRuntime;
import org.sonar.api.batch.fs.internal.DefaultInputFile;
import org.sonar.api.batch.rule.CheckFactory;
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
import org.sonar.plugin.typescript.TestActiveRules;
import org.sonar.plugin.typescript.TypeScriptPlugin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.sonar.plugin.typescript.TestUtils.createInputFile;

public class TslintReportSensorTest {

  private static final String TSLINT_REPORT_FILE_NAME = "tslint-report.json";
  @Rule
  public TemporaryFolder tmpDir = new TemporaryFolder();

  @Rule
  public final LogTester logTester = new LogTester();

  private static final File BASE_DIR = new File("src/test/resources/externalIssues/").getAbsoluteFile();
  private static final String CONTENT = "foo('aaaaaaa')\nif (cond) \n{ }";

  private SensorContextTester context = SensorContextTester.create(BASE_DIR);
  private static final CheckFactory CHECK_FACTORY = new CheckFactory(new TestActiveRules("S1751", "S113"));
  // S121 - "curly" at tslint
  private static final CheckFactory CHECK_FACTORY_WITH_TSLINT_RULE = new CheckFactory(new TestActiveRules("S1751", "S113", "S121"));

  private TslintReportSensor tslintReportSensor = new TslintReportSensor(CHECK_FACTORY);
  private DefaultInputFile inputFile = createInputFile(context, CONTENT, "myFile.ts");

  @Before
  public void setUp() {
    context.setRuntime(getRuntime(7, 2));
    context.fileSystem().add(inputFile);
  }

  @Test
  public void should_add_issues_from_report() {
    setTslintReport(TSLINT_REPORT_FILE_NAME);
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
  public void should_support_absolute_ts_file_paths_in_report() throws Exception {
    String report = "[ " +
      " {\n" +
      "    \"endPosition\": {\n" +
      "      \"character\": 1,\n" +
      "      \"line\": 2,\n" +
      "      \"position\": 18\n" +
      "    },\n" +
      "    \"failure\": \"misplaced opening brace\",\n" +
      "    \"name\": \"%s\",\n" +
      "    \"ruleName\": \"curly\",\n" +
      "    \"startPosition\": {\n" +
      "      \"character\": 0,\n" +
      "      \"line\": 2,\n" +
      "      \"position\": 19\n" +
      "    },\n" +
      "    \"ruleSeverity\": \"ERROR\"\n" +
      "  }\n" +
      "]";

    File reportFile = tmpDir.newFile();
    try (OutputStreamWriter writer = new OutputStreamWriter(new FileOutputStream(reportFile), StandardCharsets.UTF_8)) {
      writer.write(String.format(report, inputFile.absolutePath()));
    }
    setTslintReport(reportFile.getAbsolutePath());
    tslintReportSensor.execute(context);

    assertThat(context.allExternalIssues()).hasSize(1);
  }

  @Test
  public void should_skip_duplicates() {
    // when in SQ TS profile there is an activated rule matching to an external issue,
    // that external issue is ignored
    setTslintReport(TSLINT_REPORT_FILE_NAME);
    new TslintReportSensor(CHECK_FACTORY_WITH_TSLINT_RULE).execute(context);

    Collection<ExternalIssue> externalIssues = context.allExternalIssues();
    assertThat(externalIssues).hasSize(1);
    assertThat(externalIssues.iterator().next().primaryLocation().message()).isEqualTo("Missing semicolon");

    assertThat(logTester.logs(LoggerLevel.DEBUG))
      .contains("TSLint issue for rule 'curly' is skipped because this rule is activated in your SonarQube profile for TypeScript (rule key in SQ typescript:S121)");
  }

  @Test
  public void should_ignore_report_on_older_sonarqube() {
    context.setRuntime(getRuntime(7, 1));
    setTslintReport(TSLINT_REPORT_FILE_NAME);
    tslintReportSensor.execute(context);

    assertThat(context.allExternalIssues()).isEmpty();
    assertThat(logTester.logs(LoggerLevel.ERROR)).contains("Import of external issues requires SonarQube 7.2 or greater.");
  }

  @Test
  public void should_do_nothing_when_no_report() {
    setTslintReport("");
    tslintReportSensor.execute(context);

    assertThat(context.allExternalIssues()).isEmpty();
  }

  @Test
  public void should_log_when_not_existing_report_file() {
    setTslintReport("not-exist.json");
    tslintReportSensor.execute(context);

    assertThat(context.allExternalIssues()).isEmpty();
    assertThat(logTester.logs(LoggerLevel.ERROR)).contains("No issues information will be saved as the report file can't be read.");
  }

  @Test
  public void should_log_when_not_found_input_file() {
    setTslintReport("invalid-ts-file.json");
    tslintReportSensor.execute(context);

    assertThat(context.allExternalIssues()).hasSize(1);
    assertThat(logTester.logs(LoggerLevel.WARN)).contains("No input file found for not-exist.ts. No TSLint issues will be imported on this file.");
  }

  @Test
  public void should_accept_absolute_path_to_report() {
    setTslintReport(new File(BASE_DIR, TSLINT_REPORT_FILE_NAME).getAbsolutePath());
    tslintReportSensor.execute(context);
    assertThat(context.allExternalIssues()).hasSize(2);
  }

  @Test
  public void should_accept_several_reports() {
    setTslintReport("tslint-report.json, invalid-ts-file.json");
    tslintReportSensor.execute(context);
    assertThat(context.allExternalIssues()).hasSize(3);
  }

  @Test
  public void test_descriptor() {
    DefaultSensorDescriptor sensorDescriptor = new DefaultSensorDescriptor();
    tslintReportSensor.describe(sensorDescriptor);
    assertThat(sensorDescriptor.name()).isEqualTo("Import of TSLint issues");
    assertThat(sensorDescriptor.languages()).isEmpty();
  }

  private void setTslintReport(String reportFileName) {
    MapSettings settings = new MapSettings();
    settings.setProperty(TypeScriptPlugin.TSLINT_REPORT_PATHS, reportFileName);
    context.setSettings(settings);
  }

  private static SonarRuntime getRuntime(int major, int minor) {
    return SonarRuntimeImpl.forSonarQube(Version.create(major, minor), SonarQubeSide.SERVER);
  }
}
