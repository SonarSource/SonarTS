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

import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import org.sonar.api.batch.fs.InputFile;
import org.sonar.api.config.Configuration;
import org.sonar.plugin.typescript.executable.ExecutableBundle;
import org.sonar.plugin.typescript.executable.ExecutableBundleFactory;
import org.sonar.plugin.typescript.executable.SonarTSCommand;

class TestBundleFactory implements ExecutableBundleFactory {

  private String[] arguments;
  private String customNodeExecutable = null;

  private static String nodeExecutable = findNodeExecutable();

  private static String findNodeExecutable() {
    try {
      String nodeFromMavenPlugin = "target/node/node";
      Runtime.getRuntime().exec(nodeFromMavenPlugin);
      return nodeFromMavenPlugin;
    } catch (IOException e) {
      return "node";
    }
  }

  public static TestBundleFactory nodeScript(String script, String... args) {
    String[] commandArgs = Stream.concat(Stream.of(nodeExecutable, resourceScript(script)), Arrays.stream(args)).toArray(String[]::new);
    return new TestBundleFactory().command(commandArgs);
  }

  public static String getNodeExecutable() {
    return nodeExecutable;
  }

  public static String resourceScript(String script) {
    try {
      return new File(TestBundleFactory.class.getResource(script).toURI()).getAbsolutePath();
    } catch (URISyntaxException e) {
      throw new IllegalStateException(e);
    }
  }

  public TestBundleFactory command(String... arguments) {
    this.arguments = arguments;
    return this;
  }

  public TestBundleFactory setCustomNodeExecutable(String nodeExecutable) {
    customNodeExecutable = nodeExecutable;
    return this;
  }

  @Override
  public ExecutableBundle createAndDeploy(File deployDestination, Configuration configuration) {
    return new TestBundle();
  }

  private class TestBundle implements ExecutableBundle {
    @Override
    public String getNodeExecutable() {
      return customNodeExecutable != null ? customNodeExecutable : nodeExecutable;
    }

    @Override
    public SonarTSCommand getSonarTsRunnerCommand() {
      return new SonarTSCommand(arguments);
    }

    @Override
    public SonarTSCommand getSonarTSServerCommand(int port) {
      String[] argsWithPort = Stream.concat(Arrays.stream(arguments), IntStream.of(port).mapToObj(String::valueOf)).toArray(String[]::new);
      return new SonarTSCommand(argsWithPort);
    }

    @Override
    public String getRequestForRunner(String tsconfigPath, Iterable<InputFile> inputFiles, TypeScriptRules typeScriptRules) {
      return "";
    }
  }
}
