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
import java.nio.file.Path;
import java.util.Enumeration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.sonar.api.batch.fs.InputFile;
import org.sonar.api.utils.log.Logger;
import org.sonar.api.utils.log.Loggers;
import org.sonar.plugin.typescript.rules.TypeScriptRules;

public class SonarTSCoreBundle implements ExecutableBundle {

  private static final Logger LOG = Loggers.get(SonarTSCoreBundle.class);

  // relative location inside sonarts-core bundle
  private static final String SONAR_LOCATION = "node_modules/tslint-sonarts/bin/tsrunner";

  private File deployDestination;
  private String bundleLocation;
  private File tsMetricsExecutable;


  private SonarTSCoreBundle(String bundleLocation, File deployDestination) {
    this.bundleLocation = bundleLocation;
    this.deployDestination = deployDestination;

    File sonartsCoreDir = new File(deployDestination, "sonarts-core");

    this.tsMetricsExecutable = new File(sonartsCoreDir, SONAR_LOCATION);
  }

  static SonarTSCoreBundle createAndDeploy(String bundleLocation, File deployDestination) {
    LOG.debug(String.format("Deploying bundle from `%s` to `%s`", bundleLocation, deployDestination.getAbsolutePath()));
    SonarTSCoreBundle sonarTSCoreBundle = new SonarTSCoreBundle(bundleLocation, deployDestination);
    sonarTSCoreBundle.deploy();

    return sonarTSCoreBundle;
  }

  /**
   * Extracting "sonarts-core.zip" (containing typescript, tslint and tslint-sonarts)
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
   * Builds command to run rules with tsrunner
   */
  @Override
  public SonarTSRunnerCommand getRuleRunnerCommand(String tsconfigPath, Iterable<InputFile> inputFiles) {
    SonarTSRunnerCommand runnerCommand = new SonarTSRunnerCommand(inputFiles, "node", this.tsMetricsExecutable.getAbsolutePath());
    runnerCommand.setRules(tsconfigPath);
    return runnerCommand;
  }

  /**
   * Builds command to run "sonar", which is making side information calculation (metrics, highlighting etc.)
   * @param inputFiles
   */
  @Override
  public SonarTSRunnerCommand createMetricsCommand(Iterable<InputFile> inputFiles) {
    return new SonarTSRunnerCommand(inputFiles, "node", this.tsMetricsExecutable.getAbsolutePath());
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

  @Override
  public void activateRules(TypeScriptRules typeScriptRules) {
    TsLintConfig config = new TsLintConfig();
    typeScriptRules.forEach(config::addRule);
    config.save(getTsLintConfigPath());
  }

  private Path getTsLintConfigPath() {
    return deployDestination.toPath().resolve("sonarts-core/tslint.json");
  }
}
