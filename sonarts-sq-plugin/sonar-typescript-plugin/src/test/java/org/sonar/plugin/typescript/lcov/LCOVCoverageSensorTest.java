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
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.sonar.api.batch.fs.InputFile.Type;
import org.sonar.api.batch.fs.internal.DefaultInputFile;
import org.sonar.api.batch.fs.internal.FileMetadata;
import org.sonar.api.batch.fs.internal.TestInputFileBuilder;
import org.sonar.api.batch.sensor.internal.DefaultSensorDescriptor;
import org.sonar.api.batch.sensor.internal.SensorContextTester;
import org.sonar.api.config.internal.MapSettings;
import org.sonar.api.utils.log.LogTester;
import org.sonar.api.utils.log.LoggerLevel;
import org.sonar.plugin.typescript.TypeScriptPlugin;

import static org.assertj.core.api.Assertions.assertThat;

public class LCOVCoverageSensorTest {
  private static final String LCOV_REPORT_FILE = "lcov.info";
  private static final String BASE_DIR = String.join(File.separator, "src", "test", "resources", "coverage");
  private static final String FILE_TO_ANALYZE = "moduleKey:file1.ts";

  private LCOVCoverageSensor lcovCoverageSensor = new LCOVCoverageSensor();
  private SensorContextTester context;
  private File moduleBaseDir = new File(BASE_DIR).getAbsoluteFile();

  @Rule
  public LogTester logTester = new LogTester();
  private MapSettings settings;

  @Before
  public void init() throws IOException {
    settings = new MapSettings();
    settings.setProperty(TypeScriptPlugin.LCOV_REPORT_PATHS, LCOV_REPORT_FILE);

    context = SensorContextTester.create(moduleBaseDir);
    context.setSettings(settings);

    createInputFile();
  }

  @Test
  public void save_coverage() {
    lcovCoverageSensor.execute(context);

    assertThat(context.lineHits(FILE_TO_ANALYZE, 1)).isEqualTo(2);
    assertThat(context.coveredConditions(FILE_TO_ANALYZE, 2)).isEqualTo(2);
    assertThat(context.conditions(FILE_TO_ANALYZE, 2)).isEqualTo(4);

    assertThat(logTester.logs())
      .contains("Could not resolve 1 file paths in [" + new File(moduleBaseDir, LCOV_REPORT_FILE).getAbsolutePath() + "], first unresolved path: file2.ts");
  }

  @Test
  public void should_contain_sensor_descriptor() {
    DefaultSensorDescriptor descriptor = new DefaultSensorDescriptor();

    lcovCoverageSensor.describe(descriptor);
    assertThat(descriptor.name()).isEqualTo("SonarTS Coverage");
    assertThat(descriptor.languages()).containsOnly("ts");
    assertThat(descriptor.type()).isEqualTo(Type.MAIN);
    assertThat(descriptor.configurationPredicate().test(new MapSettings().setProperty("sonar.javascript.lcov.reportPaths", "foo").asConfig())).isFalse();
    assertThat(descriptor.configurationPredicate().test(new MapSettings().setProperty("sonar.typescript.lcov.reportPaths", "foo").asConfig())).isTrue();
    assertThat(descriptor.configurationPredicate().test(new MapSettings().asConfig())).isFalse();
  }

  @Test
  public void should_ignore_and_log_warning_for_invalid_line() {
    settings.setProperty(TypeScriptPlugin.LCOV_REPORT_PATHS, "reports/wrong_line_report.lcov");
    lcovCoverageSensor.execute(context);

    assertThat(context.lineHits(FILE_TO_ANALYZE, 0)).isNull();
    assertThat(context.lineHits(FILE_TO_ANALYZE, 2)).isEqualTo(1);

    assertThat(context.conditions(FILE_TO_ANALYZE, 102)).isNull();
    assertThat(context.conditions(FILE_TO_ANALYZE, 2)).isEqualTo(3);
    assertThat(context.coveredConditions(FILE_TO_ANALYZE, 2)).isEqualTo(1);

    assertThat(logTester.logs()).contains("Problem during processing LCOV report: can't save DA data for line 3 of coverage report file (java.lang.IllegalArgumentException: " +
      "Line with number 0 doesn't belong to file file1.ts).");
    assertThat(logTester.logs())
      .contains("Problem during processing LCOV report: can't save BRDA data for line 8 of coverage report file (java.lang.IllegalArgumentException: " +
        "Line with number 102 doesn't belong to file file1.ts).");
  }

  @Test
  public void should_log_warning_when_wrong_data() throws Exception {
    settings.setProperty(TypeScriptPlugin.LCOV_REPORT_PATHS, "reports/wrong_data_report.lcov");
    lcovCoverageSensor.execute(context);

    assertThat(context.lineHits(FILE_TO_ANALYZE, 1)).isNull();
    assertThat(context.lineHits(FILE_TO_ANALYZE, 2)).isEqualTo(1);

    assertThat(context.conditions(FILE_TO_ANALYZE, 2)).isEqualTo(2);
    assertThat(context.coveredConditions(FILE_TO_ANALYZE, 2)).isEqualTo(2);

    assertThat(logTester.logs(LoggerLevel.DEBUG)).contains("Problem during processing LCOV report: " +
      "can't save DA data for line 3 of coverage report file (java.lang.NumberFormatException: For input string: \"1.\").");
    // java.lang.StringIndexOutOfBoundsException may have different error message depending on JDK
    Pattern errorMessagePattern = Pattern.compile("Problem during processing LCOV report: can't save DA data for line 4 of coverage report file " +
      "[(java.lang.StringIndexOutOfBoundsException: String index out of range: -1).|(java.lang.StringIndexOutOfBoundsException: begin 0, end -1, length 1).]");
    String stringIndexOutOfBoundLogMessage = logTester.logs(LoggerLevel.DEBUG).get(1);
    assertThat(stringIndexOutOfBoundLogMessage).containsPattern(errorMessagePattern);
    assertThat(logTester.logs(LoggerLevel.DEBUG).get(logTester.logs(LoggerLevel.DEBUG).size() - 1))
      .startsWith("Problem during processing LCOV report: can't save BRDA data for line 6 of coverage report file (java.lang.ArrayIndexOutOfBoundsException: ");
    assertThat(logTester.logs(LoggerLevel.WARN)).contains("Found 3 inconsistencies in coverage report. Re-run analyse in debug mode to see details.");
  }

  private void createInputFile() throws IOException {
    DefaultInputFile inputFile = new TestInputFileBuilder("moduleKey", "file1.ts")
      .setModuleBaseDir(moduleBaseDir.toPath())
      .setLanguage("ts")
      .setType(Type.MAIN)
      .build();

    inputFile.setMetadata(new FileMetadata().readMetadata(inputFile.inputStream(), StandardCharsets.UTF_8, inputFile.absolutePath()));
    context.fileSystem().add(inputFile);
  }

}
