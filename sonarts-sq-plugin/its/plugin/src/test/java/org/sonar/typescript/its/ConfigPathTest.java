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

import com.google.common.collect.ImmutableList;
import com.sonar.orchestrator.Orchestrator;
import com.sonar.orchestrator.build.BuildResult;
import java.util.List;
import java.util.Collections;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Test;
import org.sonarqube.ws.Issues;
import org.sonarqube.ws.client.issues.SearchRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.sonar.typescript.its.Tests.newWsClient;

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
    SearchRequest request = new SearchRequest();
    request.setComponentKeys(Collections.singletonList(PROJECT_KEY)).setRules(ImmutableList.of("typescript:S1764"));
    List<Issues.Issue> issuesList = newWsClient().issues().search(request).getIssuesList();

    assertThat(issuesList).hasSize(1);
    assertThat(buildResult.getLogs()).doesNotContain("No tsconfig.json file found");

  }

  @Test
  public void withoutTSconfigPathTest() {
    BuildResult buildResult = orchestrator.executeBuild(
      Tests.createScanner("projects/tsconfig-path-project", PROJECT_KEY, "test-profile-s2201"));

    SearchRequest request = new SearchRequest();
    request.setComponentKeys(Collections.singletonList(PROJECT_KEY)).setRules(ImmutableList.of("typescript:S1764"));
    List<Issues.Issue> issuesList = newWsClient().issues().search(request).getIssuesList();

    assertThat(issuesList).hasSize(1);
    assertThat(buildResult.getLogs()).contains("No tsconfig.json file found");
  }

  @Test
  public void withWrongTSconfigPathTest() {
    BuildResult buildResult = orchestrator.executeBuild(
      Tests.createScanner("projects/tsconfig-path-project", PROJECT_KEY)
        .setProperty("sonar.typescript.tsconfigPath", "config/tsconfig.other.json"));

    SearchRequest request = new SearchRequest();
    request.setComponentKeys(Collections.singletonList(PROJECT_KEY)).setRules(ImmutableList.of("typescript:S1764"));
    List<Issues.Issue> issuesList = newWsClient().issues().search(request).getIssuesList();

    // TODO should we analyze if configured tsconfig doesn't exists
    assertThat(issuesList).hasSize(0);
    assertThat(buildResult.getLogs()).contains("Provided tsconfig.json path doesn't exist.");
  }

}
