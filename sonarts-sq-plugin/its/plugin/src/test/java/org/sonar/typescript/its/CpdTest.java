/*
 * SonarTS
 * Copyright (C) 2017-2019 SonarSource SA
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
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class CpdTest {

  private static String PROJECT_KEY = "SonarTS-cpd-test";

  @ClassRule
  public static Orchestrator orchestrator = Tests.ORCHESTRATOR;

  @BeforeClass
  public static void prepare() {
    orchestrator.resetData();

    orchestrator.executeBuild(Tests.createScanner("projects/cpd-test-project", PROJECT_KEY));
  }

  @Test
  public void should_detect_duplication() {
    assertThat(Tests.getProjectMeasureAsDouble("duplicated_lines", PROJECT_KEY)).isEqualTo(116);
  }
}
