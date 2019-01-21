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
import java.util.Collections;
import java.util.List;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Test;
import org.sonarqube.ws.Issues.Issue;
import org.sonarqube.ws.client.issues.SearchRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.sonar.typescript.its.Tests.newWsClient;

public class ComplexProjectStructureTest {

  private static final String PROJECT_KEY = "complex-structure-test-project";

  @ClassRule
  public static Orchestrator orchestrator = Tests.ORCHESTRATOR;

  @Before
  public void clean() {
    orchestrator.resetData();
  }

  @Test
  public void test() {
    String projectLocation = "projects/" + PROJECT_KEY;
    orchestrator.executeBuild(
      Tests.createScanner(projectLocation, PROJECT_KEY, projectLocation + "/module1/nestedDir")
        .setSourceDirs("")
        // to test that addition to this variable is performed correctly
        .setEnvironmentVariable("NODE_PATH", "foobar")
        .setProperty("sonar.modules", "module1")
        .setProperty("module1.sonar.sources", "nestedDir/src")
        .setProfile("test-profile"));

    SearchRequest request = new SearchRequest();
    request.setComponentKeys(Collections.singletonList(PROJECT_KEY));
    List<Issue> issuesList = newWsClient().issues().search(request).getIssuesList();
    assertThat(issuesList).extracting("line").containsExactlyInAnyOrder(3);

    assertThat(getProjectMeasureAsDouble("ncloc")).isEqualTo(3);
  }

  private Double getProjectMeasureAsDouble(String metric) {
    return Tests.getProjectMeasureAsDouble(metric, PROJECT_KEY);
  }
}
