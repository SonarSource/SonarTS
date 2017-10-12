/*
 * SonarTS
 * Copyright (C) 2017-2017 SonarSource SA
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

import com.google.common.collect.Sets;
import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.List;
import org.junit.BeforeClass;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.junit.rules.TemporaryFolder;
import org.sonar.api.batch.fs.InputFile;
import org.sonar.api.batch.fs.InputFile.Type;
import org.sonar.api.batch.fs.internal.DefaultInputFile;
import org.sonar.api.batch.fs.internal.TestInputFileBuilder;
import org.sonar.api.batch.rule.CheckFactory;
import org.sonar.api.batch.sensor.highlighting.TypeOfText;
import org.sonar.api.batch.sensor.internal.DefaultSensorDescriptor;
import org.sonar.api.batch.sensor.internal.SensorContextTester;
import org.sonar.api.batch.sensor.issue.Issue;
import org.sonar.api.issue.NoSonarFilter;
import org.sonar.api.measures.CoreMetrics;
import org.sonar.api.measures.FileLinesContext;
import org.sonar.api.measures.FileLinesContextFactory;
import org.sonar.api.utils.log.LogTester;
import org.sonar.duplications.internal.pmd.TokensLine;
import org.sonar.plugin.typescript.executable.ExecutableBundle;
import org.sonar.plugin.typescript.executable.ExecutableBundleFactory;
import org.sonar.plugin.typescript.executable.SonarTSRunnerCommand;
import org.sonar.plugin.typescript.rules.TypeScriptRules;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

public class ExternalTypescriptSensorTest {

  private static final File BASE_DIR = new File("src/test/resources");
  private static String node;

  private FileLinesContext fileLinesContext;
  private NoSonarFilter noSonarFilter;

  private static final String FILE_CONTENT = "\nfunction foo(){}";

  @Rule
  public final ExpectedException thrown = ExpectedException.none();

  @Rule
  public TemporaryFolder tmpDir = new TemporaryFolder();

  @Rule
  public final LogTester logTester = new LogTester();

  /**
   * First try 'node' from frontend-maven-plugin, fallback to 'node' from the path
   */
  @BeforeClass
  public static void setUp() throws Exception {
    try {
      String nodeFromMavenPlugin = "target/node/node";
      Runtime.getRuntime().exec(nodeFromMavenPlugin);
      node = nodeFromMavenPlugin;

    } catch (IOException e) {
      node = "node";
    }
  }

  @Test
  public void should_have_description() throws Exception {
    ExternalTypescriptSensor sensor = createSensor();
    DefaultSensorDescriptor sensorDescriptor = new DefaultSensorDescriptor();
    sensor.describe(sensorDescriptor);
    assertThat(sensorDescriptor.name()).isEqualTo("TypeScript Sensor");
    assertThat(sensorDescriptor.languages()).containsOnly("ts");
    assertThat(sensorDescriptor.type()).isEqualTo(Type.MAIN);
  }

  @Test
  public void should_run_processes_and_save_data() throws Exception {
    SensorContextTester sensorContext = createSensorContext();
    DefaultInputFile testInputFile = createTestInputFile(sensorContext);

    ExternalTypescriptSensor sensor = createSensor(new TestBundleFactory().tsMetrics(node, resourceScript("/mockTsMetrics.js"), testInputFile.absolutePath())
      .tsRules(node, resourceScript("/mockSonarTS.js"), testInputFile.absolutePath()));

    sensor.execute(sensorContext);

    assertThat(sensorContext.allIssues()).hasSize(1);

    assertThat(sensorContext.highlightingTypeAt(testInputFile.key(), 2, 3)).containsExactly(TypeOfText.KEYWORD);

    assertThat(sensorContext.measure(testInputFile.key(), CoreMetrics.NCLOC).value()).isEqualTo(3);
    assertThat(sensorContext.measure(testInputFile.key(), CoreMetrics.COMMENT_LINES).value()).isEqualTo(2);

    verify(fileLinesContext).setIntValue(CoreMetrics.NCLOC_DATA_KEY, 55, 1);
    verify(fileLinesContext).setIntValue(CoreMetrics.NCLOC_DATA_KEY, 77, 1);
    verify(fileLinesContext).setIntValue(CoreMetrics.NCLOC_DATA_KEY, 99, 1);
    verify(fileLinesContext).setIntValue(CoreMetrics.COMMENT_LINES_DATA_KEY, 24, 1);
    verify(fileLinesContext).setIntValue(CoreMetrics.COMMENT_LINES_DATA_KEY, 42, 1);
    verify(fileLinesContext).setIntValue(CoreMetrics.EXECUTABLE_LINES_DATA_KEY, 5, 1);
    verify(fileLinesContext).setIntValue(CoreMetrics.EXECUTABLE_LINES_DATA_KEY, 7, 1);
    verify(fileLinesContext).save();
    verifyNoMoreInteractions(fileLinesContext);

    verify(noSonarFilter).noSonarInFile(eq(testInputFile), eq(Sets.newHashSet(24)));

    assertThat(sensorContext.measure(testInputFile.key(), CoreMetrics.STATEMENTS).value()).isEqualTo(100);
    assertThat(sensorContext.measure(testInputFile.key(), CoreMetrics.FUNCTIONS).value()).isEqualTo(10);
    assertThat(sensorContext.measure(testInputFile.key(), CoreMetrics.CLASSES).value()).isEqualTo(1);

    List<TokensLine> cpd = sensorContext.cpdTokens(testInputFile.key());
    assertThat(cpd).hasSize(1);
    assertThat(cpd.get(0).getStartLine()).isEqualTo(2);
    assertThat(cpd.get(0).getValue()).isEqualTo("foobar");

    assertThat(logTester.logs()).contains(String.format("Setting 'NODE_PATH' to %s%sfoo%snode_modules", BASE_DIR.getAbsoluteFile(), File.separator, File.separator));
  }

  @Test
  public void should_create_file_level_issues() throws Exception {
    SensorContextTester sensorContext = createSensorContext();
    DefaultInputFile testInputFile = createTestInputFile(sensorContext);

    ExternalTypescriptSensor sensor = createSensor(new TestBundleFactory().tsMetrics(node, resourceScript("/mockTsMetrics.js"), testInputFile.absolutePath())
      .tsRules(node, resourceScript("/mockSonarTSFileLevelIssue.js"), testInputFile.absolutePath()));

    sensor.execute(sensorContext);

    assertThat(sensorContext.allIssues()).hasSize(1);
    Issue issue = sensorContext.allIssues().iterator().next();
    assertThat(issue.primaryLocation().textRange()).isNull();
  }

  @Test
  public void should_log_when_empty_sonarts_out() throws Exception {
    SensorContextTester sensorContext = createSensorContext();
    DefaultInputFile testInputFile = createTestInputFile(sensorContext);

    ExternalTypescriptSensor sensor = createSensor(new TestBundleFactory().tsMetrics(node, resourceScript("/mockTsMetrics.js"), testInputFile.absolutePath())
      .tsRules(node, resourceScript("/mockEmptyTsLint.js"), testInputFile.absolutePath()));

    sensor.execute(sensorContext);

    assertThat(sensorContext.allIssues()).hasSize(0);
    assertThat(logTester.logs().get(6)).contains("empty output");
    assertThat(logTester.logs().get(logTester.logs().size() - 1)).contains("foo/file.ts");
  }

  @Test
  public void should_find_tsconfig_in_directory_above() throws Exception {
    SensorContextTester sensorContext = createSensorContext();
    DefaultInputFile testInputFile = createTestInputFile(sensorContext, "foo/bar/file.ts");

    ExternalTypescriptSensor sensor = createSensor(new TestBundleFactory().tsMetrics(node, resourceScript("/mockTsMetrics.js"), testInputFile.absolutePath())
      .tsRules(node, resourceScript("/mockSonarTS.js"), testInputFile.absolutePath()));

    sensor.execute(sensorContext);

    assertThat(sensorContext.allIssues()).hasSize(1);
  }

  private String resourceScript(String script) throws URISyntaxException {
    return new File(getClass().getResource(script).toURI()).getAbsolutePath();
  }

  @Test
  public void should_fail_when_failed_tslint_process() throws Exception {
    TestBundleFactory testBundle = new TestBundleFactory().tsRules("non_existent_command", "arg1").tsMetrics(node, resourceScript("/mockTsMetrics.js"), "some/path/file.ts");

    thrown.expect(IllegalStateException.class);
    thrown.expectMessage("Failed to run external process `non_existent_command arg1`");

    SensorContextTester sensorContext = createSensorContext();
    createTestInputFile(sensorContext);
    createSensor(testBundle).execute(sensorContext);
  }

  @Test
  public void should_log_when_failed_ts_metrics_process() throws Exception {
    TestBundleFactory testBundle = new TestBundleFactory().tsMetrics("non_existent_command", "arg1").tsRules(node, "-e", "console.log('[]');");

    thrown.expect(IllegalStateException.class);
    thrown.expectMessage("Failed to run external process `non_existent_command arg1`");

    SensorContextTester sensorContext = createSensorContext();
    createSensor(testBundle).execute(sensorContext);
  }

  @Test
  public void should_log_when_empty_metrics_process_output() throws Exception {
    TestBundleFactory testBundle = new TestBundleFactory().tsMetrics(node, "-e", "console.log('');").tsRules(node, "-e", "console.log('[]');");
    SensorContextTester sensorContext = createSensorContext();
    createSensor(testBundle).execute(sensorContext);

    assertThat(logTester.logs()).contains("External process `" + node
      + " -e console.log('');` returned an empty output. Run with -X for more information");
  }

  @Test
  public void should_log_when_tsconfig_for_file_not_found() throws Exception {
    SensorContextTester sensorContext = createSensorContext();
    // "file.ts" is in resources directory, where there is no tsconfig.json
    DefaultInputFile inputFile = createTestInputFile(sensorContext, "file.ts");
    TestBundleFactory testBundle = new TestBundleFactory().tsMetrics(node, resourceScript("/mockTsMetrics.js"), inputFile.absolutePath()).tsRules(node, "-e", "console.log('[]');");

    createSensor(testBundle).execute(sensorContext);

    assertThat(logTester.logs()).contains("No tsconfig.json file found for " + inputFile.absolutePath() + " (looking up the directories tree). This file will not be analyzed.");
  }

  @Test
  public void should_do_nothing_when_tslint_report_with_not_existing_file() throws Exception {
    String testFile = new File(BASE_DIR, "not_exists.ts").getAbsolutePath();
    ExternalTypescriptSensor sensor = createSensor(new TestBundleFactory()
      .tsMetrics(node, resourceScript("/mockTsMetrics.js"), "some/path/file.ts")
      .tsRules(node, resourceScript("/mockSonarTS.js"), testFile));
    SensorContextTester sensorContext = createSensorContext();
    createTestInputFile(sensorContext);
    sensor.execute(sensorContext);
    assertThat(sensorContext.allIssues()).hasSize(0);
  }

  @Test
  public void should_not_fail_when_stdErr_tslint_is_not_empty() throws Exception {
    TestBundleFactory testBundle = new TestBundleFactory().tsRules("cat", "not_existing_file").tsMetrics(node, resourceScript("/mockTsMetrics.js"), "some/path/file.ts");
    SensorContextTester sensorContext = createSensorContext();
    createSensor(testBundle).execute(sensorContext);

    assertThat(sensorContext.allIssues()).hasSize(0);
  }

  @Test(timeout = 2000)
  public void should_not_deadlock_with_large_stdErr() throws Exception {
    TestBundleFactory testBundle = new TestBundleFactory().tsRules(node, resourceScript("/rulesDeadlock.js")).tsMetrics(node, resourceScript("/mockTsMetrics.js"), "some/path/file.ts");
    SensorContextTester sensorContext = createSensorContext();
    createTestInputFile(sensorContext);
    createSensor(testBundle).execute(sensorContext);

    assertThat(sensorContext.allIssues()).hasSize(0);
  }

  private SensorContextTester createSensorContext() {
    SensorContextTester sensorContext = SensorContextTester.create(BASE_DIR);
    sensorContext.fileSystem().setWorkDir(tmpDir.getRoot());
    return sensorContext;
  }

  private ExternalTypescriptSensor createSensor() {
    return createSensor(new TestBundleFactory());
  }

  private ExternalTypescriptSensor createSensor(ExecutableBundleFactory executableBundleFactory) {
    FileLinesContextFactory fileLinesContextFactory = mock(FileLinesContextFactory.class);
    fileLinesContext = mock(FileLinesContext.class);
    when(fileLinesContextFactory.createFor(any(InputFile.class))).thenReturn(fileLinesContext);

    noSonarFilter = mock(NoSonarFilter.class);
    CheckFactory checkFactory = new CheckFactory(new TestActiveRules("S1751", "S113"));
    return new ExternalTypescriptSensor(executableBundleFactory, noSonarFilter, fileLinesContextFactory, checkFactory);
  }

  private DefaultInputFile createTestInputFile(SensorContextTester sensorContext) {
    DefaultInputFile testInputFile = new TestInputFileBuilder("moduleKey", "foo/file.ts")
      .setModuleBaseDir(BASE_DIR.toPath())
      .setType(Type.MAIN)
      .setLanguage(TypeScriptLanguage.KEY)
      .setCharset(StandardCharsets.UTF_8)
      .setContents(FILE_CONTENT)
      .build();

    sensorContext.fileSystem().add(testInputFile);
    return testInputFile;
  }

  private DefaultInputFile createTestInputFile(SensorContextTester sensorContext, String relativePath) {
    DefaultInputFile testInputFile = new TestInputFileBuilder("moduleKey", relativePath)
      .setModuleBaseDir(BASE_DIR.toPath())
      .setType(Type.MAIN)
      .setLanguage(TypeScriptLanguage.KEY)
      .setCharset(StandardCharsets.UTF_8)
      .setContents(FILE_CONTENT)
      .build();

    sensorContext.fileSystem().add(testInputFile);
    return testInputFile;
  }

  private static class TestBundleFactory implements ExecutableBundleFactory {

    private String[] ruleCheckCommand;
    private String[] sonarCommand;

    public TestBundleFactory tsRules(String... ruleCheckCommmand) {
      this.ruleCheckCommand = ruleCheckCommmand;
      return this;
    }

    public TestBundleFactory tsMetrics(String... sonarCommand) {
      this.sonarCommand = sonarCommand;
      return this;
    }

    @Override
    public ExecutableBundle createAndDeploy(File deployDestination) {
      return new TestBundle();
    }

    private class TestBundle implements ExecutableBundle {

      @Override
      public SonarTSRunnerCommand getTsMetricsCommand() {
        return new SonarTSRunnerCommand(sonarCommand);
      }

      @Override
      public void activateRules(TypeScriptRules typeScriptRules) {
      }

      @Override
      public SonarTSRunnerCommand getRuleRunnerCommand(String tsconfigPath, Collection<InputFile> inputFiles) {
        return new SonarTSRunnerCommand(ruleCheckCommand);
      }
    }
  }

}
