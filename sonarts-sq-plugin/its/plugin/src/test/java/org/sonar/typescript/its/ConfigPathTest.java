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

import static org.assertj.core.api.Assertions.assertThat;

import com.sonar.orchestrator.Orchestrator;
import com.sonar.orchestrator.build.BuildResult;

import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Test;

public class ConfigPathTest {

  private static String PROJECT_KEY = "SonarTS-tsconfig-path-test";

  @ClassRule
  public static Orchestrator orchestrator = Tests.ORCHESTRATOR;

  @Before
  public void clean() {
    orchestrator.resetData();
  }

  @Test
  public void tsconfigPathTest() {
    BuildResult buildResult = orchestrator.executeBuild(
      Tests.createScanner("projects/tsconfig-path-project", PROJECT_KEY)
        .setProperty("sonar.typescript.tsconfigPath", "config/tsconfig.json"));

    assertThat(!buildResult.getLogs().contains("No tsconfig.json file found "));
  }

}
