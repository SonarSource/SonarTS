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
package org.sonar.plugin.typescript.executable;

import com.google.gson.Gson;
import java.io.File;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;
import org.sonar.api.batch.fs.InputFile;
import org.sonar.api.config.Configuration;
import org.sonar.plugin.typescript.SensorContextUtils;
import org.sonar.plugin.typescript.SensorContextUtils.RuleToExecute;
import org.sonar.plugin.typescript.TypeScriptPlugin;
import org.sonar.plugin.typescript.TypeScriptRules;

public class SonarTSCoreBundle implements ExecutableBundle {

  private static final int NODE_PROCESS_MEMORY = 2048;

  // relative location inside sonarts-core bundle
  private static final String BIN = "node_modules/tslint-sonarts/bin/";
  private final Configuration configuration;

  private final File sonartsRunnerExecutable;
  private final File sonartsServerExecutable;

  public SonarTSCoreBundle(File deployDir, Configuration configuration) {
    this.configuration = configuration;
    this.sonartsRunnerExecutable = new File(deployDir, BIN + "tsrunner");
    this.sonartsServerExecutable = new File(deployDir, BIN + "sonarts-server");
  }

  /**
   * Builds command to run rules and calculate metrics with tsrunner
   */
  @Override
  public SonarTSCommand getSonarTsRunnerCommand() {
    return getCommand(sonartsRunnerExecutable);
  }

  @Override
  public String getRequestForRunner(String tsconfigPath, Iterable<InputFile> inputFiles, TypeScriptRules typeScriptRules) {
    SonarTSRequest request = new SonarTSRequest();
    request.filepaths = StreamSupport.stream(inputFiles.spliterator(), false).map(inputFile -> Paths.get(inputFile.uri()).toString()).toArray(String[]::new);
    request.tsconfig = tsconfigPath;
    request.rules = SensorContextUtils.convertToRulesToExecute(typeScriptRules);

    return new Gson().toJson(request);
  }

  private SonarTSCommand getCommand(File executable, String... additionalArgs) {
    String increaseMemory = "--max-old-space-size=" + NODE_PROCESS_MEMORY;
    Stream<String> args = Stream.of(getNodeExecutable(), increaseMemory, executable.getAbsolutePath());
    return new SonarTSCommand(Stream.concat(args, Arrays.stream(additionalArgs)).toArray(String[]::new));
  }

  /**
   * Returns path to node.js executable
   */
  @Override
  public String getNodeExecutable() {
    Optional<String> nodeExecutableOptional = configuration.get(TypeScriptPlugin.NODE_EXECUTABLE);
    if (nodeExecutableOptional.isPresent()) {
      String nodeExecutable = nodeExecutableOptional.get();
      File file = new File(nodeExecutable);
      if (file.exists()) {
        return nodeExecutable;
      }
    }
    return TypeScriptPlugin.NODE_EXECUTABLE_DEFAULT;
  }

  @Override
  public SonarTSCommand getSonarTSServerCommand(int port) {
    return getCommand(sonartsServerExecutable, String.valueOf(port));
  }

  private static class SonarTSRequest {
    String[] filepaths;
    String tsconfig;
    List<RuleToExecute> rules;
  }

}
