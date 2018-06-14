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
package org.sonar.typescript.its;

import com.sonar.orchestrator.Orchestrator;
import com.sonar.orchestrator.OrchestratorBuilder;
import com.sonar.orchestrator.build.SonarScanner;
import com.sonar.orchestrator.locator.FileLocation;
import java.io.File;
import java.util.List;
import org.junit.ClassRule;
import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.sonar.api.utils.System2;
import org.sonar.api.utils.command.Command;
import org.sonar.api.utils.command.CommandExecutor;
import org.sonarqube.ws.Measures.ComponentWsResponse;
import org.sonarqube.ws.Measures.Measure;
import org.sonarqube.ws.client.HttpConnector;
import org.sonarqube.ws.client.WsClient;
import org.sonarqube.ws.client.WsClientFactories;
import org.sonarqube.ws.client.measures.ComponentRequest;

import static java.util.Collections.singletonList;

@RunWith(Suite.class)
@Suite.SuiteClasses({
  TypescriptPluginTest.class,
  CpdTest.class,
  TsxTest.class,
  ProfileTest.class,
  GlobalTypescriptModuleTest.class,
  CoverageTest.class,
  FutureSyntaxTest.class,
  ComplexProjectStructureTest.class,
  IssuesTest.class,
  FileWithBomTest.class,
  TslintRulesTest.class
})
public class Tests {

  static final FileLocation PLUGIN_LOCATION = FileLocation.byWildcardMavenFilename(
    new File("../../sonar-typescript-plugin/target"), "sonar-typescript-plugin-*.jar");

  @ClassRule
  public static final Orchestrator ORCHESTRATOR;

  static {
    OrchestratorBuilder orchestratorBuilder = Orchestrator.builderEnv()
      .setSonarVersion(System.getProperty("sonar.runtimeVersion", "7.2-RC1"))
      .addPlugin(PLUGIN_LOCATION);

    File profilesDir = new File("src/test/resources/profiles/");
    for (File file : profilesDir.listFiles()) {
      orchestratorBuilder.restoreProfileAtStartup(FileLocation.of(file));
    }

    ORCHESTRATOR = orchestratorBuilder.build();
  }

  public static WsClient newWsClient() {
    return WsClientFactories.getDefault().newClient(HttpConnector.newBuilder()
      .url(ORCHESTRATOR.getServer().getUrl())
      .build());
  }

  public static Double getProjectMeasureAsDouble(String metricKey, String projectKey) {
    Measure measure = getMeasure(metricKey, projectKey);
    return (measure == null) ? null : Double.parseDouble(measure.getValue());
  }

  private static Measure getMeasure(String metricKey, String projectKey) {
    ComponentWsResponse response = newWsClient().measures().component(new ComponentRequest()
      .setComponent(projectKey)
      .setMetricKeys(singletonList(metricKey)));
    List<Measure> measures = response.getComponent().getMeasuresList();
    return measures.size() == 1 ? measures.get(0) : null;
  }

  static void runNPMInstall(File projectDir, String... args) {
    Command command = Command.create(System2.INSTANCE.isOsWindows() ? "npm.cmd" : "npm");
    command.addArgument("install");
    command.addArguments(args);
    command.setDirectory(projectDir);

    try {
      CommandExecutor commandExecutor = CommandExecutor.create();
      int result = commandExecutor.execute(command, 600_000);
      if (result != 0) {
        throw new IllegalStateException("Unable to run npm install");
      }
    } catch (Exception e) {
      throw new IllegalStateException(command.toCommandLine(), e);
    }
  }

  public static SonarScanner createScanner(String location, String projectKey) {
    return createScanner(location, projectKey, location);
  }

  public static SonarScanner createScanner(String location, String projectKey, String nodeProjectLocation) {
    File projectDir = FileLocation.of(location).getFile();
    File nodeProjectDir = FileLocation.of(nodeProjectLocation).getFile();

    Tests.runNPMInstall(nodeProjectDir);

    return SonarScanner.create()
      .setSourceEncoding("UTF-8")
      .setProjectDir(projectDir)
      .setProjectKey(projectKey)
      .setProjectName(projectKey)
      .setProjectVersion("1.0")
      .setSourceDirs("src");
  }

}
