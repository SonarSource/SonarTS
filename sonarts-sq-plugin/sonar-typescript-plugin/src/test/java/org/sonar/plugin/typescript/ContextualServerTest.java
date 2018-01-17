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

import java.io.File;
import java.io.IOException;
import org.junit.BeforeClass;
import org.junit.Rule;
import org.junit.Test;
import org.sonar.api.batch.fs.InputFile;
import org.sonar.api.config.Configuration;
import org.sonar.api.config.internal.MapSettings;
import org.sonar.api.utils.internal.JUnitTempFolder;
import org.sonar.api.utils.log.LogTester;
import org.sonar.api.utils.log.LoggerLevel;
import org.sonar.plugin.typescript.executable.ExecutableBundle;
import org.sonar.plugin.typescript.executable.ExecutableBundleFactory;
import org.sonar.plugin.typescript.executable.SonarTSCommand;

import static org.assertj.core.api.Assertions.assertThat;
import static org.sonar.plugin.typescript.TestUtils.resourceScript;

public class ContextualServerTest {

  private static String node;

  @org.junit.Rule
  public JUnitTempFolder temp = new JUnitTempFolder();

  @Rule
  public final LogTester logTester = new LogTester();

  /**
   * First try 'node' from frontend-maven-plugin, fallback to 'node' from the path
   */
  @BeforeClass
  public static void setUp() {
    try {
      String nodeFromMavenPlugin = "target/node/node";
      Runtime.getRuntime().exec(nodeFromMavenPlugin);
      node = nodeFromMavenPlugin;

    } catch (IOException e) {
      node = "node";
    }
  }

  @Test
  public void should_start_and_stop() {
    MapSettings mapSettings = new MapSettings();
    mapSettings.setProperty("sonar.typescript.internal.typescriptLocation", "not used in tests");
    ContextualServer contextualServer = new ContextualServer(mapSettings.asConfig(), mockTSServer(), temp);
    contextualServer.start();
    assertThat(contextualServer.isAlive()).isTrue();
    assertThat(logTester.logs()).contains("SonarTS Server is started");
    contextualServer.stop();
    assertThat(logTester.logs()).contains("SonarTS Server is stopped");
  }

  @Test
  public void should_log_warning_if_not_typescript_location_provided() {
    ContextualServer contextualServer = new ContextualServer(new MapSettings().asConfig(), mockTSServer(), temp);
    contextualServer.start();

    assertThat(logTester.logs(LoggerLevel.WARN))
      .containsOnlyOnce("No value provided by SonarLint for TypeScript location; property sonar.typescript.internal.typescriptLocation is missing");
    contextualServer.stop();
  }

  @Test
  public void should_not_start_or_stop_twice() {
    ContextualServer contextualServer = new ContextualServer(new MapSettings().asConfig(), mockTSServer(), temp);
    contextualServer.start();
    contextualServer.start();

    assertThat(logTester.logs(LoggerLevel.WARN)).containsOnlyOnce("Skipping SonarTS Server start, already running");
    contextualServer.stop();
    contextualServer.stop();
    assertThat(logTester.logs(LoggerLevel.WARN)).containsOnlyOnce("SonarTS Server was already stopped");
  }

  @Test
  public void should_fail_when_not_started() {
    ContextualServer contextualServer = new ContextualServer(new MapSettings().asConfig(), new TestBundleFactory().command(node, "--version"), temp);
    contextualServer.start();
    assertThat(logTester.logs(LoggerLevel.ERROR)).containsOnlyOnce("Failed to start SonarTS Server");
    assertThat(contextualServer.isAlive()).isFalse();
  }

  private TestBundleFactory mockTSServer() {
    return new TestBundleFactory().command(node, resourceScript("/mockSonarTSServer.js"));
  }

  private static class TestBundleFactory implements ExecutableBundleFactory {

    private String[] ruleCheckCommand;
    private String customNodeExecutable = null;

    public TestBundleFactory command(String... ruleCheckCommmand) {
      this.ruleCheckCommand = ruleCheckCommmand;
      return this;
    }

    public TestBundleFactory setCustomNodeExecutable(String nodeExecutable) {
      customNodeExecutable = nodeExecutable;
      return this;
    }

    @Override
    public ExecutableBundle createAndDeploy(File deployDestination, Configuration configuration) {
      return new TestBundleFactory.TestBundle();
    }

    private class TestBundle implements ExecutableBundle {
      @Override
      public String getNodeExecutable() {
        return customNodeExecutable != null ? customNodeExecutable : node;
      }

      @Override
      public SonarTSCommand getSonarTsRunnerCommand() {
        return new SonarTSCommand(ruleCheckCommand);
      }

      @Override
      public SonarTSCommand getSonarTSServerCommand() {
        return new SonarTSCommand(ruleCheckCommand);
      }

      @Override
      public String getRequestForRunner(String tsconfigPath, Iterable<InputFile> inputFiles, TypeScriptRules typeScriptRules) {
        return "";
      }
    }
  }

}

