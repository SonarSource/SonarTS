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

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.util.Enumeration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.sonar.api.batch.fs.InputFile;
import org.sonar.api.config.Settings;
import org.sonar.api.utils.log.Logger;
import org.sonar.api.utils.log.Loggers;
import org.sonar.plugin.typescript.TypeScriptPlugin;
import org.sonar.plugin.typescript.TypeScriptRules;

public class SonarTSCoreBundle implements ExecutableBundle {

  private static final Logger LOG = Loggers.get(SonarTSCoreBundle.class);

  // relative location inside tslint-sonarts bundle
  private static final String SONAR_LOCATION = "node_modules/tslint-sonarts/bin/tsrunner";
  private final Settings settings;

  private File deployDestination;
  private String bundleLocation;
  private File tsMetricsExecutable;

  private SonarTSCoreBundle(String bundleLocation, File deployDestination, Settings settings) {
    this.bundleLocation = bundleLocation;
    this.deployDestination = deployDestination;
    this.settings = settings;

    File sonartsCoreDir = new File(deployDestination, "sonarts-bundle");

    this.tsMetricsExecutable = new File(sonartsCoreDir, SONAR_LOCATION);
  }

  static SonarTSCoreBundle createAndDeploy(String bundleLocation, File deployDestination, Settings settings) {
    LOG.debug(String.format("Deploying bundle from `%s` to `%s`", bundleLocation, deployDestination.getAbsolutePath()));
    SonarTSCoreBundle sonarTSCoreBundle = new SonarTSCoreBundle(bundleLocation, deployDestination, settings);
    sonarTSCoreBundle.deploy();

    return sonarTSCoreBundle;
  }

  /**
   * Extracting "tslint-sonarts.zip" (containing typescript, tslint and tslint-sonarts)
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
  public SonarTSRunnerCommand getSonarTsRunnerCommand(String tsconfigPath, Iterable<InputFile> inputFiles, TypeScriptRules typeScriptRules) {
    String nodeExecutable = settings.getString(TypeScriptPlugin.NODE_EXECUTABLE);
    SonarTSRunnerCommand runnerCommand = new SonarTSRunnerCommand(inputFiles, nodeExecutable, this.tsMetricsExecutable.getAbsolutePath());
    runnerCommand.setTsConfigPath(tsconfigPath);
    typeScriptRules.forEach(rule -> {
      if(rule.isEnabled()) {
        runnerCommand.addRule(rule.tsLintKey(), rule.configuration());
      }
    });
    return runnerCommand;
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

}
