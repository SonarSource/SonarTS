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
package org.sonar.plugin.typescript.executable;

import com.google.gson.Gson;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.List;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.sonar.api.batch.fs.InputFile;
import org.sonar.api.config.Configuration;
import org.sonar.api.utils.log.Logger;
import org.sonar.api.utils.log.Loggers;
import org.sonar.plugin.typescript.SensorContextUtils;
import org.sonar.plugin.typescript.SensorContextUtils.RuleToExecute;
import org.sonar.plugin.typescript.TypeScriptPlugin;
import org.sonar.plugin.typescript.TypeScriptRules;

public class SonarTSCoreBundle implements ExecutableBundle {

  private static final Logger LOG = Loggers.get(SonarTSCoreBundle.class);
  private static final int NODE_PROCESS_MEMORY = 2048;

  // relative location inside sonarts-core bundle
  private static final String BIN = "node_modules/tslint-sonarts/bin/";
  private final Configuration configuration;

  private File deployDestination;

  private String bundleLocation;
  private File sonartsRunnerExecutable;
  private File sonartsServerExecutable;

  private SonarTSCoreBundle(String bundleLocation, File deployDestination, Configuration configuration) {
    this.bundleLocation = bundleLocation;
    this.deployDestination = deployDestination;
    this.configuration = configuration;

    File sonartsCoreDir = new File(deployDestination, "sonarts-bundle");

    this.sonartsRunnerExecutable = new File(sonartsCoreDir, BIN + "tsrunner");
    this.sonartsServerExecutable = new File(sonartsCoreDir, BIN + "sonarts-server");
  }

  static SonarTSCoreBundle createAndDeploy(String bundleLocation, File deployDestination, Configuration configuration) {
    LOG.debug(String.format("Deploying bundle from `%s` to `%s`", bundleLocation, deployDestination.getAbsolutePath()));
    SonarTSCoreBundle sonarTSCoreBundle = new SonarTSCoreBundle(bundleLocation, deployDestination, configuration);
    sonarTSCoreBundle.deploy();

    return sonarTSCoreBundle;
  }

  /**
   * Extracting "sonarts-core.zip" (containing tslint and tslint-sonarts)
   * to deployDestination (".sonar" directory of the analyzed project).
   */
  private void deploy() {
    try {
      File copiedFile = copyTo(deployDestination);
      extract(copiedFile);
      Files.delete(copiedFile.toPath());

    } catch (Exception e) {
      throw new IllegalStateException("Failed to deploy SonarTS bundle (with classpath '" + bundleLocation + "')", e);
    }
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
    return configuration.get(TypeScriptPlugin.NODE_EXECUTABLE).orElse(TypeScriptPlugin.NODE_EXECUTABLE_DEFAULT);
  }

  @Override
  public SonarTSCommand getSonarTSServerCommand(int port) {
    return getCommand(sonartsServerExecutable, String.valueOf(port));
  }

  private File copyTo(File targetPath) throws IOException {
    File destination = new File(targetPath, bundleLocation);
    FileUtils.copyInputStreamToFile(getClass().getResourceAsStream(bundleLocation), destination);
    return destination;
  }

  /*
   * A minor variant of code found here : https://stackoverflow.com/a/13912353/7672957
   */
  private static void extract(File copiedFile) throws IOException {
    try (ZipFile zipFile = new ZipFile(copiedFile)) {
      Enumeration<? extends ZipEntry> entries = zipFile.entries();
      while (entries.hasMoreElements()) {
        ZipEntry entry = entries.nextElement();
        File entryDestination = new File(copiedFile.getParent(), entry.getName());
        if (entry.isDirectory()) {
          entryDestination.mkdirs();
        } else {
          entryDestination.getParentFile().mkdirs();
          InputStream in = zipFile.getInputStream(entry);
          OutputStream out = new FileOutputStream(entryDestination);
          IOUtils.copy(in, out);
          IOUtils.closeQuietly(in);
          out.close();
        }
      }
    }
  }

  private static class SonarTSRequest {
    String[] filepaths;
    String tsconfig;
    List<RuleToExecute> rules;
  }

}
