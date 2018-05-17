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
import org.sonar.api.batch.fs.internal.DefaultInputFile;
import org.sonar.api.batch.rule.Severity;
import org.sonar.api.batch.sensor.internal.DefaultSensorDescriptor;
import org.sonar.api.batch.sensor.internal.SensorContextTester;
import org.sonar.api.batch.sensor.issue.ExternalIssue;
import org.sonar.api.config.internal.MapSettings;
import org.sonar.api.internal.SonarRuntimeImpl;
import org.sonar.api.rules.RuleType;
import org.sonar.api.utils.Version;
import org.sonar.api.utils.log.LogTester;
import org.sonar.plugin.typescript.TypeScriptLanguage;
import org.sonar.plugin.typescript.TypeScriptPlugin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.sonar.plugin.typescript.TestUtils.createInputFile;

public class EslintReportSensorTest {

  @Rule
  public final LogTester logTester = new LogTester();

  private static final File BASE_DIR = new File("src/test/resources/externalIssues/").getAbsoluteFile();
  private static final String CONTENT = "function addOne(i: number) {\n" +
    "    if (i != NaN) {\n" +
    "        return i ++\n" +
    "    } else {\n" +
    "      return\n" +
    "    }\n" +
    "};";

  private SensorContextTester context = SensorContextTester.create(BASE_DIR);

  private EslintReportSensor eslintReportSensor = new EslintReportSensor();
  private DefaultInputFile inputFile = createInputFile(context, CONTENT, "myFile.ts");

  @Before
  public void setUp() throws Exception {
    context.setRuntime(getRuntime(7, 2));
    context.fileSystem().add(inputFile);
  }

  @Test
  public void should_add_issues_from_report() throws Exception {
    setEslintReport("eslint-report.json");
    eslintReportSensor.execute(context);

    Collection<ExternalIssue> externalIssues = context.allExternalIssues();
    assertThat(externalIssues).hasSize(2);
    Iterator<ExternalIssue> iterator = externalIssues.iterator();
    ExternalIssue first = iterator.next();
    ExternalIssue second = iterator.next();

    assertThat(first.type()).isEqualTo(RuleType.BUG);
    assertThat(second.type()).isEqualTo(RuleType.CODE_SMELL);

    assertThat(first.remediationEffort()).isEqualTo(5);
    assertThat(first.severity()).isEqualTo(Severity.MAJOR);
    assertThat(first.primaryLocation().message()).isEqualTo("Use the isNaN function to compare with NaN.");
    assertThat(first.primaryLocation().textRange().start().line()).isEqualTo(2);
  }


  @Test
  public void test_descriptor() throws Exception {
    DefaultSensorDescriptor sensorDescriptor = new DefaultSensorDescriptor();
    eslintReportSensor.describe(sensorDescriptor);
    assertThat(sensorDescriptor.name()).isEqualTo("Import of ESLint issues");
    assertThat(sensorDescriptor.languages()).containsOnly(TypeScriptLanguage.KEY);
  }

  private void setEslintReport(String reportFileName) {
    MapSettings settings = new MapSettings();
    settings.setProperty(TypeScriptPlugin.ESLINT_REPORT_PATHS, reportFileName);
    context.setSettings(settings);
  }

  private SonarRuntime getRuntime(int major, int minor) {
    return SonarRuntimeImpl.forSonarQube(Version.create(major, minor), SonarQubeSide.SERVER);
  }
}
