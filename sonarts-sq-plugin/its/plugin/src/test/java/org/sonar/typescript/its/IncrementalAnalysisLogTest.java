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
package org.sonar.typescript.its;

import com.sonar.orchestrator.Orchestrator;
import com.sonar.orchestrator.build.BuildResult;
import com.sonar.orchestrator.build.SonarScanner;
import com.sonar.orchestrator.locator.FileLocation;
import org.apache.commons.io.FileUtils;
import org.junit.ClassRule;
import org.junit.Test;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;

public class IncrementalAnalysisLogTest {

  private static String PROJECT_KEY = "SonarTS-issues-test";

  @ClassRule
  public static Orchestrator orchestrator = Tests.ORCHESTRATOR;

  @Test
  public void should_log_incrementally_during_analysis() throws IOException {
    orchestrator.resetData();
    BuildResult buildResult = orchestrator.executeBuild(Tests.createScanner("projects/issues-test-project", PROJECT_KEY));

    String logs = buildResult.getLogs();
    assertThat(Pattern.compile("files analyzed out of").matcher(logs).find()).isTrue();
  }

  private Double getProjectMeasureAsDouble(String metric) {
    return Tests.getProjectMeasureAsDouble(metric, PROJECT_KEY);
  }
}
