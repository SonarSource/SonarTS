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
package org.sonar.plugin.typescript;

import com.google.common.collect.Sets;
import java.io.BufferedReader;
import java.io.File;
import java.util.Collection;
import java.util.List;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.junit.rules.TemporaryFolder;
import org.sonar.api.batch.fs.InputFile;
import org.sonar.api.batch.fs.InputFile.Type;
import org.sonar.api.batch.fs.TextRange;
import org.sonar.api.batch.fs.internal.DefaultInputFile;
import org.sonar.api.batch.sensor.highlighting.TypeOfText;
import org.sonar.api.batch.sensor.internal.DefaultSensorDescriptor;
import org.sonar.api.batch.sensor.internal.SensorContextTester;
import org.sonar.api.batch.sensor.issue.Issue;
import org.sonar.api.issue.NoSonarFilter;
import org.sonar.api.measures.CoreMetrics;
import org.sonar.api.measures.FileLinesContext;
import org.sonar.api.measures.FileLinesContextFactory;
import org.sonar.api.utils.log.LogTester;
import org.sonar.api.utils.log.LoggerLevel;
import org.sonar.duplications.internal.pmd.TokensLine;
import org.sonar.plugin.typescript.executable.ExecutableBundleFactory;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;
import static org.sonar.plugin.typescript.TestUtils.BASE_DIR;
import static org.sonar.plugin.typescript.TestUtils.CHECK_FACTORY;
import static org.sonar.plugin.typescript.TestUtils.createInputFile;

public class ExternalTypescriptSensorTest {

  private FileLinesContext fileLinesContext;
  private NoSonarFilter noSonarFilter;

  private static final String FILE_CONTENT = "\nfunction foo(){}";

  @Rule
  public final ExpectedException thrown = ExpectedException.none();

  @Rule
  public TemporaryFolder tmpDir = new TemporaryFolder();

  @Rule
  public final LogTester logTester = new LogTester();

  @Test
  public void should_have_description() throws Exception {
    ExternalTypescriptSensor sensor = createSensor();
    DefaultSensorDescriptor sensorDescriptor = new DefaultSensorDescriptor();
    sensor.describe(sensorDescriptor);
    assertThat(sensorDescriptor.name()).isEqualTo("SonarTS");
    assertThat(sensorDescriptor.languages()).containsOnly("ts");
    assertThat(sensorDescriptor.type()).isEqualTo(Type.MAIN);
  }

  @Test
  public void should_run_processes_and_save_data() throws Exception {
    SensorContextTester sensorContext = createSensorContext();
    DefaultInputFile testInputFile = createTestInputFile(sensorContext);

    TestBundleFactory bundleFactory = TestBundleFactory.nodeScript("/mockSonarTS.js", testInputFile.absolutePath());
    executeSensor(sensorContext, bundleFactory);

    assertThat(sensorContext.allIssues()).hasSize(1);
    Issue issue = sensorContext.allIssues().iterator().next();
    assertThat(issue.flows()).hasSize(1);
    assertThat(issue.gap()).isEqualTo(42);

    assertThat(sensorContext.highlightingTypeAt(testInputFile.key(), 2, 3)).containsExactly(TypeOfText.KEYWORD);

    assertThat(sensorContext.measure(testInputFile.key(), CoreMetrics.NCLOC).value()).isEqualTo(3);
    assertThat(sensorContext.measure(testInputFile.key(), CoreMetrics.COMMENT_LINES).value()).isEqualTo(2);

    verify(fileLinesContext).setIntValue(CoreMetrics.NCLOC_DATA_KEY, 55, 1);
    verify(fileLinesContext).setIntValue(CoreMetrics.NCLOC_DATA_KEY, 77, 1);
    verify(fileLinesContext).setIntValue(CoreMetrics.NCLOC_DATA_KEY, 99, 1);
    verify(fileLinesContext).setIntValue(CoreMetrics.EXECUTABLE_LINES_DATA_KEY, 5, 1);
    verify(fileLinesContext).setIntValue(CoreMetrics.EXECUTABLE_LINES_DATA_KEY, 7, 1);
    verify(fileLinesContext).save();
    verifyNoMoreInteractions(fileLinesContext);

    verify(noSonarFilter).noSonarInFile(eq(testInputFile), eq(Sets.newHashSet(24)));

    assertThat(sensorContext.measure(testInputFile.key(), CoreMetrics.STATEMENTS).value()).isEqualTo(100);
    assertThat(sensorContext.measure(testInputFile.key(), CoreMetrics.FUNCTIONS).value()).isEqualTo(10);
    assertThat(sensorContext.measure(testInputFile.key(), CoreMetrics.CLASSES).value()).isEqualTo(1);
    assertThat(sensorContext.measure(testInputFile.key(), CoreMetrics.COMPLEXITY).value()).isEqualTo(42);
    assertThat(sensorContext.measure(testInputFile.key(), CoreMetrics.COGNITIVE_COMPLEXITY).value()).isEqualTo(22);

    List<TokensLine> cpd = sensorContext.cpdTokens(testInputFile.key());
    assertThat(cpd).hasSize(1);
    assertThat(cpd.get(0).getStartLine()).isEqualTo(2);
    assertThat(cpd.get(0).getValue()).isEqualTo("foobar");

    Collection<TextRange> usages = sensorContext.referencesForSymbolAt(testInputFile.key(), 2, 0);
    assertThat(usages).hasSize(1);
    assertThat(usages.iterator().next().start().lineOffset()).isEqualTo(6);

    assertThat(logTester.logs()).contains(String.format("Setting 'NODE_PATH' to %s%sfoo%snode_modules", BASE_DIR.getAbsoluteFile(), File.separator, File.separator));
  }

  @Test
  public void should_create_file_level_issues() throws Exception {
    SensorContextTester sensorContext = createSensorContext();
    DefaultInputFile testInputFile = createTestInputFile(sensorContext);

    TestBundleFactory bundleFactory = TestBundleFactory.nodeScript("/mockSonarTSFileLevelIssue.js", testInputFile.absolutePath());
    executeSensor(sensorContext, bundleFactory);

    assertThat(sensorContext.allIssues()).hasSize(1);
    Issue issue = sensorContext.allIssues().iterator().next();
    assertThat(issue.primaryLocation().textRange()).isNull();
  }

  @Test
  public void should_use_defaults_if_missing_data() throws Exception {
    SensorContextTester sensorContext = createSensorContext();
    DefaultInputFile testInputFile = createTestInputFile(sensorContext);

    TestBundleFactory bundleFactory = TestBundleFactory.nodeScript("/mockSonarTSMissingData.js", testInputFile.absolutePath());
    executeSensor(sensorContext, bundleFactory);

    assertThat(sensorContext.allIssues()).hasSize(0);
    assertThat(sensorContext.measure(testInputFile.key(), CoreMetrics.NCLOC).value()).isEqualTo(0);
    assertThat(sensorContext.measure(testInputFile.key(), CoreMetrics.FUNCTIONS).value()).isEqualTo(0);
  }

  @Test
  public void should_log_when_empty_sonarts_out() throws Exception {
    SensorContextTester sensorContext = createSensorContext();
    DefaultInputFile testInputFile = createTestInputFile(sensorContext);

    TestBundleFactory bundleFactory = TestBundleFactory.nodeScript("/mockEmptyResponse.js", testInputFile.absolutePath());
    executeSensor(sensorContext, bundleFactory);

    assertThat(sensorContext.allIssues()).hasSize(0);
    boolean containsMessage = logTester.logs(LoggerLevel.ERROR).stream().anyMatch(log -> log.contains("returned an empty output. Run with -X for more information"));
    assertThat(containsMessage).isTrue();

    containsMessage = logTester.logs(LoggerLevel.ERROR).stream().anyMatch(log -> log.contains("foo/file.ts"));
    assertThat(containsMessage).isTrue();
  }

  @Test
  public void should_find_tsconfig_in_directory_above() throws Exception {
    SensorContextTester sensorContext = createSensorContext();
    DefaultInputFile testInputFile = createTestInputFile(sensorContext, "foo/bar/file.ts");

    TestBundleFactory bundleFactory = TestBundleFactory.nodeScript("/mockSonarTS.js", testInputFile.absolutePath());
    executeSensor(sensorContext, bundleFactory);

    assertThat(sensorContext.allIssues()).hasSize(1);
  }

  @Test
  public void should_fail_when_failed_external_process() throws Exception {
    TestBundleFactory testBundle = new TestBundleFactory().command("non_existent_command", "arg1");

    thrown.expect(IllegalStateException.class);
    thrown.expectMessage("Failed to run external process `non_existent_command arg1`");

    SensorContextTester sensorContext = createSensorContext();
    createTestInputFile(sensorContext);
    executeSensor(sensorContext, testBundle);
  }

  @Test(expected = IllegalStateException.class)
  public void should_log_and_fail_with_old_node() throws Exception {
    SensorContextTester sensorContext = createSensorContext();
    DefaultInputFile testInputFile = createTestInputFile(sensorContext);

    TestBundleFactory testBundle = TestBundleFactory
      .nodeScript("/mockSonarTS.js", testInputFile.absolutePath())
      .setCustomNodeExecutable(TestBundleFactory.getNodeExecutable() + " " + TestBundleFactory.resourceScript("/oldNodeVersion.js"));

    createTestInputFile(sensorContext);
    executeSensor(sensorContext, testBundle);
  }

  @Test(expected = IllegalStateException.class)
  public void should_log_and_fail_with_invalid_node_version() throws Exception {
    SensorContextTester sensorContext = createSensorContext();
    DefaultInputFile testInputFile = createTestInputFile(sensorContext);

    TestBundleFactory testBundle = TestBundleFactory
      .nodeScript("/mockSonarTS.js", testInputFile.absolutePath())
      .setCustomNodeExecutable(TestBundleFactory.getNodeExecutable() + " " + TestBundleFactory.resourceScript("/invalidNodeVersion.js"));

    createTestInputFile(sensorContext);
    executeSensor(sensorContext, testBundle);
  }

  @Test
  public void should_log_when_tsconfig_for_file_not_found() throws Exception {
    SensorContextTester sensorContext = createSensorContext();
    // "file.ts" is in resources directory, where there is no tsconfig.json
    DefaultInputFile inputFile = createTestInputFile(sensorContext, "file.ts");
    TestBundleFactory testBundle = TestBundleFactory.nodeScript("/mockSonarTS.js", inputFile.absolutePath());

    executeSensor(sensorContext, testBundle);

    assertThat(logTester.logs(LoggerLevel.ERROR)).contains("No tsconfig.json file found for [" +
      inputFile.uri() + "] (looking up the directories tree until project base directory [" +
      sensorContext.fileSystem().baseDir().getAbsolutePath() + "]). This file will not be analyzed.");
  }

  @Test
  public void should_do_nothing_when_response_with_not_existing_file() throws Exception {
    new File(BASE_DIR, "not_exists.ts").getAbsolutePath();
    TestBundleFactory bundleFactory = TestBundleFactory.nodeScript("/mockSonarTS.js", "some/path/file.ts");
    SensorContextTester sensorContext = createSensorContext();
    createTestInputFile(sensorContext);
    executeSensor(sensorContext, bundleFactory);
    assertThat(sensorContext.allIssues()).hasSize(0);
  }

  @Test
  public void should_log_debug_if_no_local_typescript_found() throws Exception {
    SensorContextTester sensorContext = SensorContextTester.create(new File(BASE_DIR, "dirWithoutTypeScript"));
    sensorContext.fileSystem().setWorkDir(tmpDir.getRoot().toPath());
    DefaultInputFile testInputFile = createTestInputFile(sensorContext, "dirWithoutTypeScript/file.ts");

    TestBundleFactory testBundle = TestBundleFactory.nodeScript("/mockSonarTS.js", testInputFile.absolutePath());
    executeSensor(sensorContext, testBundle);

    assertThat(logTester.setLevel(LoggerLevel.DEBUG).logs()).contains("No TypeScript compiler found in your project");
    assertThat(logTester.setLevel(LoggerLevel.DEBUG).logs()).contains("Global one referenced in 'NODE_PATH' will be used");
    assertThat(sensorContext.allIssues()).hasSize(1);
  }

  @Test
  public void should_log_error_if_no_typescript_found() throws Exception {
    SensorContextTester sensorContext = SensorContextTester.create(new File(BASE_DIR, "dirWithoutTypeScript"));
    sensorContext.fileSystem().setWorkDir(tmpDir.getRoot().toPath());
    DefaultInputFile testInputFile = createTestInputFile(sensorContext, "dirWithoutTypeScript/file.ts");

    TestBundleFactory testBundle = TestBundleFactory.nodeScript("/mockTypescriptNotFound.js", testInputFile.absolutePath());
    executeSensor(sensorContext, testBundle, new TestableErrorConsumer(500));

    assertThat(logTester.setLevel(LoggerLevel.DEBUG).logs()).contains("No TypeScript compiler found in your project");
    assertThat(logTester.setLevel(LoggerLevel.DEBUG).logs()).contains("Global one referenced in 'NODE_PATH' will be used");
    assertThat(logTester.setLevel(LoggerLevel.ERROR).logs()).contains("Failed to find 'typescript' module. Please check, NODE_PATH contains location of global 'typescript' or install locally in your project");
    assertThat(sensorContext.allIssues()).hasSize(0);
  }

  @Test
  public void should_relog_error() throws Exception {
    SensorContextTester sensorContext = createSensorContext();
    DefaultInputFile testInputFile = createTestInputFile(sensorContext);

    TestBundleFactory testBundleFactory = TestBundleFactory.nodeScript("/mockError.js", testInputFile.absolutePath());
    executeSensor(sensorContext, testBundleFactory);
    assertThat(logTester.setLevel(LoggerLevel.ERROR).logs()).contains("Some error");
    assertThat(sensorContext.allIssues()).hasSize(1);
  }

  @Test(timeout = 2000)
  public void should_not_deadlock_with_large_stdErr() throws Exception {
    TestBundleFactory testBundle = TestBundleFactory.nodeScript("/rulesDeadlock.js");
    SensorContextTester sensorContext = createSensorContext();
    createTestInputFile(sensorContext);
    createSensor(testBundle, new LineTrimmingExternalProcessErrorConsumer()).execute(sensorContext);

    assertThat(sensorContext.allIssues()).hasSize(0);
  }

  @Test
  public void should_log_syntax_errors() throws Exception {
    SensorContextTester sensorContext = createSensorContext();
    DefaultInputFile testInputFile = createTestInputFile(sensorContext);
    TestBundleFactory testBundleFactory = TestBundleFactory.nodeScript("/mockDiagnostics.js", testInputFile.absolutePath());
    executeSensor(sensorContext, testBundleFactory);
    assertThat(logTester.setLevel(LoggerLevel.ERROR).logs()).contains("Compilation error at foo" + File.separator + "file.ts:1 \"Expression expected.\"");
    assertThat(sensorContext.allAnalysisErrors()).hasSize(1);
  }

  private SensorContextTester createSensorContext() {
    SensorContextTester sensorContext = SensorContextTester.create(BASE_DIR);
    sensorContext.fileSystem().setWorkDir(tmpDir.getRoot().toPath());
    return sensorContext;
  }

  private void executeSensor(SensorContextTester sensorContext, TestBundleFactory testBundle) {
    executeSensor(sensorContext, testBundle, new TestableErrorConsumer(0));
  }

  private void executeSensor(SensorContextTester sensorContext, TestBundleFactory testBundle, TestableErrorConsumer errorConsumer) {
    createSensor(testBundle, errorConsumer).execute(sensorContext);
    await().until(() -> errorConsumer.running == null || !errorConsumer.running);
  }

  private ExternalTypescriptSensor createSensor() {
    return createSensor(new TestBundleFactory(), new LineTrimmingExternalProcessErrorConsumer());
  }

  private ExternalTypescriptSensor createSensor(ExecutableBundleFactory executableBundleFactory, ExternalProcessStreamConsumer errorConsumer) {
    FileLinesContextFactory fileLinesContextFactory = mock(FileLinesContextFactory.class);
    fileLinesContext = mock(FileLinesContext.class);
    when(fileLinesContextFactory.createFor(any(InputFile.class))).thenReturn(fileLinesContext);

    noSonarFilter = mock(NoSonarFilter.class);
    return new ExternalTypescriptSensor(executableBundleFactory, noSonarFilter, fileLinesContextFactory, CHECK_FACTORY, errorConsumer);
  }

  private DefaultInputFile createTestInputFile(SensorContextTester sensorContext) {
    return createInputFile(sensorContext, FILE_CONTENT, "foo/file.ts");
  }

  private DefaultInputFile createTestInputFile(SensorContextTester sensorContext, String relativePath) {
    return createInputFile(sensorContext, FILE_CONTENT, relativePath);
  }

  public static class LineTrimmingExternalProcessErrorConsumer extends ExternalProcessStreamConsumer {

    private int trimmingLimit = 100;

    public LineTrimmingExternalProcessErrorConsumer() {
      start();
    }

    @Override
    protected void readErrors(BufferedReader errorReader, StreamConsumer streamConsumer) {
      errorReader.lines().forEach(line -> {
        if (line.length() > trimmingLimit) {
          streamConsumer.consumeLine(line.substring(0, trimmingLimit - 1) + "...");
        } else {
          streamConsumer.consumeLine(line);
        }
      });
      streamConsumer.finished();
    }
  }

  private static class TestableErrorConsumer extends ExternalProcessStreamConsumer {

    volatile Boolean running = null;
    private int delay;

    TestableErrorConsumer(int delay) {
      this.delay = delay;
      start();
    }

    @Override
    protected void readErrors(BufferedReader errorReader, StreamConsumer streamConsumer) {
      running = true;
      sleep(delay);
      super.readErrors(errorReader, streamConsumer);
      running = false;
    }
  }

  private static void sleep(int millis) {
    try {
      Thread.sleep(millis);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
    }
  }
}
