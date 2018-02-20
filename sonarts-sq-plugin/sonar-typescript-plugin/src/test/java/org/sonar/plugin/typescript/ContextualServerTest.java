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

import com.google.common.base.Stopwatch;
import java.io.IOException;
import java.util.concurrent.TimeUnit;
import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.sonar.api.batch.fs.internal.DefaultInputFile;
import org.sonar.api.batch.sensor.internal.SensorContextTester;
import org.sonar.api.config.Configuration;
import org.sonar.api.config.internal.MapSettings;
import org.sonar.api.utils.internal.JUnitTempFolder;
import org.sonar.api.utils.log.LogTester;
import org.sonar.api.utils.log.LoggerLevel;
import org.sonar.plugin.typescript.SensorContextUtils.AnalysisResponse;
import org.sonar.plugin.typescript.SensorContextUtils.ContextualAnalysisRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.sonar.plugin.typescript.TestUtils.BASE_DIR;
import static org.sonar.plugin.typescript.TestUtils.TYPE_SCRIPT_RULES;
import static org.sonar.plugin.typescript.TestUtils.createInputFile;

public class ContextualServerTest {

  private static final int CONNECTION_TIMEOUT = 1_000;

  @org.junit.Rule
  public JUnitTempFolder temp = new JUnitTempFolder();

  @Rule
  public final LogTester logTester = new LogTester();
  private ExternalProcessStreamConsumer externalProcessStreamConsumer;

  @Before
  public void setUp() {
    externalProcessStreamConsumer = new ExternalProcessStreamConsumer();
    externalProcessStreamConsumer.start();
  }

  @After
  public void tearDown() throws Exception {
    externalProcessStreamConsumer.stop();
  }

  @Test
  public void should_start_and_stop() throws Exception {
    ContextualServer contextualServer = getContextualServer();
    contextualServer.start();
    assertThat(contextualServer.isAlive()).isTrue();
    await().until(() -> logTester.logs().contains("SonarTS Server is started")
      && logTester.logs().stream().anyMatch(log -> log.startsWith("SonarTS Server connected to")));
    contextualServer.stop();
    await().until(() -> logTester.logs().contains("SonarTS Server is stopped"));
  }

  @Test
  public void should_log_warning_if_not_typescript_location_provided() {
    ContextualServer contextualServer = new ContextualServer(new MapSettings().asConfig(), mockTSServer(), temp, CONNECTION_TIMEOUT);
    contextualServer.start();

    assertThat(logTester.logs(LoggerLevel.WARN))
      .containsOnlyOnce(
        "No value provided by SonarLint for TypeScript location; property sonar.typescript.internal.typescriptLocation is missing",
        "Skipping SonarTS Server start.")
      .doesNotContain("Starting SonarTS Server");

    assertThat(contextualServer.isAlive()).isFalse();
  }

  @Test
  public void should_not_try_to_send_request_if_start_process_failed() throws Exception {
    ContextualServer contextualServer = new ContextualServer(defaultConfiguration(), mockFailingTSServer(), temp, CONNECTION_TIMEOUT);
    ContextualAnalysisRequest request = getContextualAnalysisRequest();
    contextualServer.start();
    assertThat(logTester.logs(LoggerLevel.ERROR)).contains("Failed to start SonarTS Server");

    contextualServer.analyze(request);
    assertThat(logTester.logs(LoggerLevel.WARN)).contains("Skipped analysis as SonarTS Server is not running");
  }

  @Test
  public void should_not_start_or_stop_twice() throws Exception {
    ContextualServer contextualServer = getContextualServer();
    contextualServer.start();
    contextualServer.start();

    contextualServer.stop();
    contextualServer.stop();
    assertThat(logTester.logs(LoggerLevel.WARN)).containsOnlyOnce("Skipping SonarTS Server start, already running");
    assertThat(logTester.logs(LoggerLevel.WARN)).containsOnlyOnce("SonarTS Server was already stopped");
  }

  @Test
  public void should_fail_when_not_started() {
    ContextualServer contextualServer = new ContextualServer(defaultConfiguration(), new TestBundleFactory().command(TestBundleFactory.getNodeExecutable(), "--version"), temp, CONNECTION_TIMEOUT);
    contextualServer.start();
    assertThat(logTester.logs(LoggerLevel.ERROR)).containsOnlyOnce("Failed to start SonarTS Server");
    assertThat(contextualServer.isAlive()).isFalse();
  }

  @Test
  public void should_provide_analysis_results() throws Exception {
    ContextualServer contextualServer = getContextualServer();
    contextualServer.start();

    ContextualAnalysisRequest request = getContextualAnalysisRequest();
    AnalysisResponse analyze = contextualServer.analyze(request);

    assertThat(analyze.issues).hasSize(1);
    assertThat(analyze.cpdTokens).isEmpty();
  }

  @Test
  public void consume_stdout_stderr() throws Exception {
    ContextualServer contextualServer = getContextualServer();
    contextualServer.start();
    await().until(() ->
      logTester.logs(LoggerLevel.INFO).contains("SonarTS Server connected to 12345")
        && logTester.logs(LoggerLevel.ERROR).contains("this is error")
    );
  }

  @Test
  public void should_use_default_timeout() {
    ContextualServer server = new ContextualServer(new MapSettings().asConfig(), mockFailingTSServer(), temp);
    Stopwatch stopwatch = Stopwatch.createStarted();
    try {
      server.start();
    } catch (Exception e) {
      assertThat(stopwatch.elapsed(TimeUnit.MILLISECONDS)).isGreaterThan(5_000);
    }
  }

  private ContextualAnalysisRequest getContextualAnalysisRequest() throws IOException {
    DefaultInputFile inputFile = createInputFile(SensorContextTester.create(BASE_DIR), "function foo() {}", "foo/file.ts");
    return new ContextualAnalysisRequest(inputFile, TYPE_SCRIPT_RULES);
  }

  private ContextualServer getContextualServer() {
    return new ContextualServer(defaultConfiguration(), mockTSServer(), temp, CONNECTION_TIMEOUT);
  }

  private TestBundleFactory mockTSServer() {
    return TestBundleFactory.nodeScript("/mockSonarTSServer.js");
  }

  private TestBundleFactory mockFailingTSServer() {
    return TestBundleFactory.nodeScript("/mockFailingSonarTSServer.js");
  }

  private Configuration defaultConfiguration() {
    MapSettings mapSettings = new MapSettings();
    mapSettings.setProperty("sonar.typescript.internal.typescriptLocation", "not used in tests");
    return mapSettings.asConfig();
  }
}

