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
package org.sonar.plugin.typescript.lcov;

import com.google.common.base.Charsets;
import java.io.File;
import java.io.IOException;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.sonar.api.batch.fs.InputFile.Type;
import org.sonar.api.batch.fs.internal.DefaultInputFile;
import org.sonar.api.batch.fs.internal.FileMetadata;
import org.sonar.api.batch.fs.internal.TestInputFileBuilder;
import org.sonar.api.batch.sensor.internal.SensorContextTester;
import org.sonar.api.config.MapSettings;
import org.sonar.api.config.Settings;
import org.sonar.api.utils.log.LogTester;
import org.sonar.plugin.typescript.TypeScriptPlugin;

import static org.assertj.core.api.Assertions.assertThat;

public class LCOVCoverageSensorTest {
  private static final String LCOV = "lcov.info";
  private static final String BASE_DIR = String.join(File.separator, "src", "test", "resources", "coverage");

  private LCOVCoverageSensor lcovCoverageSensor = new LCOVCoverageSensor();
  private SensorContextTester context;
  private File moduleBaseDir = new File(BASE_DIR);

  @Rule
  public LogTester logTester = new LogTester();

  @Before
  public void init() throws IOException {
    Settings settings = new MapSettings();
    settings.setProperty(TypeScriptPlugin.LCOV_REPORT_PATHS, LCOV);

    context = SensorContextTester.create(moduleBaseDir);
    context.setSettings(settings);

    createInputFile();
  }

  @Test
  public void save_coverage() throws Exception {
    lcovCoverageSensor.execute(context);

    assertThat(context.lineHits("moduleKey:file1.ts", 1)).isEqualTo(2);
    assertThat(context.coveredConditions("moduleKey:file1.ts", 2)).isEqualTo(2);
    assertThat(context.conditions("moduleKey:file1.ts", 2)).isEqualTo(4);

    assertThat(logTester.logs().get(1)).containsSequence("Could not resolve 1 file paths in [", BASE_DIR, "], first unresolved path: file2.ts");
  }

  private void createInputFile() throws IOException {
    DefaultInputFile inputFile = new TestInputFileBuilder("moduleKey", "file1.ts")
      .setModuleBaseDir(moduleBaseDir.toPath())
      .setLanguage("ts")
      .setType(Type.MAIN)
      .build();

    inputFile.setMetadata(new FileMetadata().readMetadata(inputFile.inputStream(), Charsets.UTF_8, inputFile.absolutePath()));
    context.fileSystem().add(inputFile);
  }

}
