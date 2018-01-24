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
package org.sonar.plugin.typescript.lcov;

import java.io.File;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import org.sonar.api.batch.fs.InputFile.Type;
import org.sonar.api.batch.sensor.Sensor;
import org.sonar.api.batch.sensor.SensorContext;
import org.sonar.api.batch.sensor.SensorDescriptor;
import org.sonar.api.utils.log.Logger;
import org.sonar.api.utils.log.Loggers;
import org.sonar.plugin.typescript.TypeScriptLanguage;
import org.sonar.plugin.typescript.TypeScriptPlugin;

public class LCOVCoverageSensor implements Sensor {
  private static final Logger LOG = Loggers.get(LCOVCoverageSensor.class);

  @Override
  public void execute(SensorContext context) {
    List<String> reportPaths = Arrays.asList(context.config().getStringArray(TypeScriptPlugin.LCOV_REPORT_PATHS));

    if (!reportPaths.isEmpty()) {
      saveMeasureFromLCOVFile(context, reportPaths);
    }
  }

  private void saveMeasureFromLCOVFile(SensorContext context, List<String> reportPaths) {
    List<File> lcovReportFiles = new LinkedList<>();

    for(String reportPath : reportPaths) {
      File lcovFile = getIOFile(context.fileSystem().baseDir(), reportPath);

      if (lcovFile.isFile()) {
        lcovReportFiles.add(lcovFile);

      } else {
        LOG.warn("No coverage information will be saved because LCOV file cannot be found.");
        LOG.warn("Provided LCOV file path: {}. Seek file with path: {}", reportPath, lcovFile.getAbsolutePath());
      }
    }

    if(lcovReportFiles.isEmpty()) {
      LOG.warn("No coverage information will be saved because all LCOV coverage report files cannot be found.");
      return;
    }

    LOG.info("Analysing {}", lcovReportFiles);

    LCOVParser parser = new LCOVParser(context);
    parser.parseReportsAndSaveCoverage(lcovReportFiles);

    List<String> unresolvedPaths = parser.unresolvedPaths();
    if (!unresolvedPaths.isEmpty()) {
      LOG.warn(
        String.format(
          "Could not resolve %d file paths in %s, first unresolved path: %s",
          unresolvedPaths.size(), lcovReportFiles, unresolvedPaths.get(0)));
    }
  }

  /**
   * Returns a java.io.File for the given path.
   * If path is not absolute, returns a File with module base directory as parent path.
   */
  private static File getIOFile(File baseDir, String path) {
    File file = new File(path);
    if (!file.isAbsolute()) {
      file = new File(baseDir, path);
    }

    return file;
  }

  @Override
  public void describe(SensorDescriptor descriptor) {
    descriptor
      .onlyOnLanguage(TypeScriptLanguage.KEY)
      .name("SonarTS Coverage")
      .onlyOnFileType(Type.MAIN);
  }
}
