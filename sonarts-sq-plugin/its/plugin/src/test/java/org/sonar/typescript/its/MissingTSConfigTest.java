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
import java.util.Collections;
import java.util.List;
import org.junit.ClassRule;
import org.junit.Test;
import org.sonarqube.ws.Issues.Issue;
import org.sonarqube.ws.client.issues.SearchRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.sonar.typescript.its.Tests.newWsClient;

public class MissingTSConfigTest {

  private static final String PROJECT_KEY = "SonarTS-missing-tsconfig";
  private static final String PROJECT_KEY_MIXED_TSCONFIG = "SonarTS-mixed-tsconfig";

  @ClassRule
  public static final Orchestrator orchestrator = Tests.ORCHESTRATOR;

  public static void prepare(String location, String projectKey) {
    orchestrator.executeBuild(Tests.createScanner(location, projectKey, "test-profile"));
  }

  @Test
  public void should_work_without_tsconfig() {
    prepare("projects/missing-tsconfig", PROJECT_KEY);
    SearchRequest request = new SearchRequest();
    request.setComponentKeys(Collections.singletonList(PROJECT_KEY)).setRules(ImmutableList.of("typescript:S1764"));
    List<Issue> issuesList = newWsClient().issues().search(request).getIssuesList();
    assertThat(issuesList).hasSize(1);
  }

  @Test
  public void should_work_when_some_files_dont_have_tsconfig() {
    prepare("projects/mixed-tsconfig", PROJECT_KEY_MIXED_TSCONFIG);
    SearchRequest request = new SearchRequest();
    request.setComponentKeys(Collections.singletonList(PROJECT_KEY_MIXED_TSCONFIG)).setRules(ImmutableList.of("typescript:S1764"));
    List<Issue> issuesList = newWsClient().issues().search(request).getIssuesList();
    // TODO should analyze app.ts without tsconfig
    assertThat(issuesList).hasSize(1);
  }

}
