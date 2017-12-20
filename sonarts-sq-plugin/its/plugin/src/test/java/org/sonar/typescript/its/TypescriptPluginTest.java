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
package org.sonar.typescript.its;

import com.google.common.collect.ImmutableList;
import com.sonar.orchestrator.Orchestrator;
import java.util.Collections;
import java.util.List;
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Test;
import org.sonarqube.ws.Issues.Issue;
import org.sonarqube.ws.client.issue.SearchWsRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.sonar.typescript.its.Tests.newWsClient;

public class TypescriptPluginTest {

  private static String PROJECT_KEY = "SonarTS-plugin-test";

  @ClassRule
  public static Orchestrator orchestrator = Tests.ORCHESTRATOR;

  @BeforeClass
  public static void prepare() {
    orchestrator.resetData();

    orchestrator.executeBuild(Tests.createScanner("projects/plugin-test-project", PROJECT_KEY));
  }

  @Test
  public void should_have_loaded_issues_into_project_and_ignore_issue_with_nosonar() {
    SearchWsRequest request = new SearchWsRequest();
    request.setProjectKeys(Collections.singletonList(PROJECT_KEY)).setRules(ImmutableList.of("typescript:S1764"));
    List<Issue> issuesList = newWsClient().issues().search(request).getIssuesList();
    assertThat(issuesList).hasSize(1);
    assertThat(issuesList.get(0).getLine()).isEqualTo(2);
  }

  @Test
  public void should_raise_issues_using_type_checker() {
    SearchWsRequest request = new SearchWsRequest();
    request.setProjectKeys(Collections.singletonList(PROJECT_KEY)).setRules(ImmutableList.of("typescript:S2201"));
    List<Issue> issuesList = newWsClient().issues().search(request).getIssuesList();
    assertThat(issuesList).hasSize(1);
    assertThat(issuesList.get(0).getLine()).isEqualTo(11);
  }

  @Test
  public void should_save_metrics() {
    // Size
    assertThat(getProjectMeasureAsDouble("ncloc")).isEqualTo(11);
    assertThat(getProjectMeasureAsDouble("classes")).isEqualTo(0);
    assertThat(getProjectMeasureAsDouble("functions")).isEqualTo(1);
    assertThat(getProjectMeasureAsDouble("statements")).isEqualTo(7);

    // Documentation
    assertThat(getProjectMeasureAsDouble("comment_lines")).isEqualTo(1);

    // Complexity
    assertThat(getProjectMeasureAsDouble("complexity")).isEqualTo(3.0);

    // Duplication
    assertThat(getProjectMeasureAsDouble("duplicated_lines")).isEqualTo(0.0);

    // Tests
    assertThat(getProjectMeasureAsDouble("tests")).isNull();
    assertThat(getProjectMeasureAsDouble("coverage")).isEqualTo(0.0);
  }

  private Double getProjectMeasureAsDouble(String metric) {
    return Tests.getProjectMeasureAsDouble(metric, PROJECT_KEY);
  }
}
