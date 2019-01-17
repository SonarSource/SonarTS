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

import com.google.common.base.Charsets;
import java.io.File;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.assertj.core.util.Files;
import org.junit.Rule;
import org.junit.Test;
import org.sonar.api.batch.fs.InputFile;
import org.sonar.api.batch.fs.InputFile.Type;
import org.sonar.api.batch.fs.internal.DefaultInputFile;
import org.sonar.api.batch.fs.internal.TestInputFileBuilder;
import org.sonar.api.utils.log.LogTester;
import org.sonar.api.utils.log.LoggerLevel;

import static org.assertj.core.api.Assertions.assertThat;

public class SensorContextUtilsTest {

  private static final String BASE_DIR = String.join(File.separator, "src", "test", "resources", "excludedLineSeparators");
  private File moduleBaseDir = new File(BASE_DIR).getAbsoluteFile();

  @Rule
  public final LogTester logTester = new LogTester();

  @Test
  public void exclude_characters() throws Exception {
    InputFile lineSeparator = createInputFile("LINE_SEPARATOR.ts");
    InputFile paragraphSeparator = createInputFile("PARAGRAPH_SEPARATOR.ts");
    InputFile normal = createInputFile("normal.ts");
    InputFile invalid = new TestInputFileBuilder("moduleKey", "invalid")
      .setModuleBaseDir(moduleBaseDir.toPath())
      .setLanguage("ts")
      .setType(Type.MAIN).build();

    assertThat(SensorContextUtils.excludeInputFilesWithUnreadableCharacters(Arrays.asList(normal, invalid, lineSeparator, paragraphSeparator))).containsOnly(normal);

    List<String> warnLogs = logTester.logs(LoggerLevel.WARN);
    assertThat(warnLogs).hasSize(3);
    assertThat(warnLogs).contains(
      "Excluding 2 file(s) because of unrecognized NEW_LINE characters:",
      " - LINE_SEPARATOR.ts ('\\u2028')",
      " - PARAGRAPH_SEPARATOR.ts ('\\u2029')");
  }

  @Test
  public void no_exclusion_means_no_logs() throws Exception {
    InputFile normal = createInputFile("normal.ts");

    assertThat(SensorContextUtils.excludeInputFilesWithUnreadableCharacters(Collections.singletonList(normal))).containsOnly(normal);

    List<String> logs = logTester.logs();
    assertThat(logs).isEmpty();
  }

  private InputFile createInputFile(String fileName) {
    DefaultInputFile inputFile = new TestInputFileBuilder("moduleKey", fileName)
      .setModuleBaseDir(moduleBaseDir.toPath())
      .setLanguage("ts")
      .setType(Type.MAIN)
      .setContents(Files.contentOf(new File(moduleBaseDir, fileName), Charsets.UTF_8))
      .build();
    return inputFile;
  }

}
