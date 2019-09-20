/*
 * SonarTS
 * Copyright (C) 2017-2019 SonarSource SA
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
import org.assertj.core.util.Lists;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.junit.rules.TemporaryFolder;
import org.sonar.api.batch.fs.internal.DefaultInputFile;
import org.sonar.api.batch.fs.internal.TestInputFileBuilder;
import org.sonar.api.batch.rule.ActiveRules;
import org.sonar.api.batch.rule.CheckFactory;
import org.sonar.api.config.PropertyDefinition;
import org.sonar.api.config.PropertyDefinitions;
import org.sonar.api.config.internal.MapSettings;
import org.sonar.plugin.typescript.executable.ExecutableBundle;
import org.sonar.plugin.typescript.executable.SonarTSCommand;
import org.sonar.plugin.typescript.executable.SonarTSCoreBundle;
import org.sonar.plugin.typescript.executable.SonarTSCoreBundleFactory;

import static org.assertj.core.api.Assertions.assertThat;

public class SonarTSCoreBundleTest {

  private static final String BUNDLE_RELATIVE_PATH = "/testBundle.zip";
  @Rule
  public TemporaryFolder temporaryFolder = new TemporaryFolder();

  @Rule
  public ExpectedException expectedException = ExpectedException.none();

  private File deployDestination;

  @Before
  public void setUp() throws Exception {
    deployDestination = temporaryFolder.newFolder("deployDestination");
  }

  @Test
  public void should_create_command() {
    ExecutableBundle bundle = new SonarTSCoreBundleFactory(BUNDLE_RELATIVE_PATH).createAndDeploy(deployDestination, getSettings().asConfig());
    File projectBaseDir = new File("/myProject");
    File tsconfig = new File(projectBaseDir, "tsconfig.json");
    DefaultInputFile file1 = new TestInputFileBuilder("moduleKey", "file1.ts").build();
    DefaultInputFile file2 = new TestInputFileBuilder("moduleKey", "file2.ts").build();

    SonarTSCommand ruleCommand = bundle.getSonarTsRunnerCommand();
    String ruleCommandContent = bundle.getRequestForRunner(tsconfig.getAbsolutePath(), Lists.newArrayList(file1, file2), getTypeScriptRules(), projectBaseDir.getAbsolutePath());
    assertThat(ruleCommand.commandLine())
      .isEqualTo("node --max-old-space-size=2048 " + new File(deployDestination, "sonarts-bundle/node_modules/tslint-sonarts/bin/tsrunner").getAbsolutePath());
    assertThat(ruleCommandContent).contains("file1.ts");
    assertThat(ruleCommandContent).contains("file2.ts");
    assertThat(ruleCommandContent).contains("tsconfig.json");
    assertThat(ruleCommandContent).contains("no-dead-store");
  }

  private static MapSettings getSettings() {
    return new MapSettings(new PropertyDefinitions(PropertyDefinition.builder(TypeScriptPlugin.NODE_EXECUTABLE).defaultValue("node").build()));
  }

  private static TypeScriptRules getTypeScriptRules() {
    ActiveRules activeRules = new TestActiveRules("S1854"); // no-dead-store
    return new TypeScriptRules(new CheckFactory(activeRules));
  }

  @Test
  public void should_fail_when_bad_zip() {
    expectedException.expect(IllegalStateException.class);
    expectedException.expectMessage("Failed to deploy SonarTS bundle (with classpath '/badZip.zip')");
    new SonarTSCoreBundleFactory("/badZip.zip").createAndDeploy(deployDestination, getSettings().asConfig());
  }

  @Test
  public void should_execute_node_from_settings() throws Exception {
    MapSettings settings = getSettings();
    File customNode = temporaryFolder.newFile("custom-node.exe");
    settings.setProperty("sonar.typescript.node", customNode.getAbsolutePath());
    SonarTSCoreBundle bundle = new SonarTSCoreBundleFactory(BUNDLE_RELATIVE_PATH).createAndDeploy(deployDestination, settings.asConfig());
    SonarTSCommand command = bundle.getSonarTsRunnerCommand();
    String commandLine = command.commandLine();
    assertThat(commandLine).startsWith(customNode.getAbsolutePath());

    settings = new MapSettings();
    settings.setProperty("sonar.nodejs.executable", customNode.getAbsolutePath());
    bundle = new SonarTSCoreBundleFactory(BUNDLE_RELATIVE_PATH).createAndDeploy(deployDestination, settings.asConfig());
    command = bundle.getSonarTsRunnerCommand();
    commandLine = command.commandLine();
    assertThat(commandLine).startsWith(customNode.getAbsolutePath());
  }

  @Test
  public void should_use_default_node_if_custom_doesnt_exists() {
    MapSettings settings = getSettings();
    settings.setProperty("sonar.typescript.node", "/path/that/doesnt/exists/node");
    SonarTSCoreBundle bundle = new SonarTSCoreBundleFactory(BUNDLE_RELATIVE_PATH).createAndDeploy(deployDestination, settings.asConfig());
    SonarTSCommand command = bundle.getSonarTsRunnerCommand();
    String commandLine = command.commandLine();
    assertThat(commandLine).startsWith("node");
  }
}
