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

import com.google.common.collect.ImmutableList;
import com.sonar.orchestrator.Orchestrator;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import org.junit.ClassRule;
import org.junit.Test;
import org.sonarqube.ws.Issues.Issue;
import org.sonarqube.ws.client.issues.SearchRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.sonar.typescript.its.Tests.newWsClient;

public class TslintRulesTest {

  private static final String PROJECT_KEY = "SonarTS-tslint-rules-test";

  @ClassRule
  public static Orchestrator orchestrator = Tests.ORCHESTRATOR;

  @Test
  public void S1441_should_avoid_escape_in_quote_rule() {
    List<Issue> issueList = getIssues("S1441", "profile-single-quotes");
    assertThat(issueList).extracting("line").containsExactlyElementsOf(ImmutableList.of(1));

    issueList = getIssues("S1441", "profile-double-quotes");
    assertThat(issueList).extracting("line").containsExactlyElementsOf(ImmutableList.of(3));
  }

  @Test
  public void S4328_should_consider_peer_dependencies() {
    List<Issue> issueList = getIssues("S4328", "profile-no-implicit-dependencies");
    assertThat(issueList).extracting("line").doesNotContainAnyElementsOf(ImmutableList.of(1));
  }

  private List<Issue> getIssues(String ruleKey, String profileKey) {
    orchestrator.resetData();
    orchestrator.executeBuild(Tests.createScanner("projects/tslint-rules-test-project", PROJECT_KEY).setProfile(profileKey));

    SearchRequest request = new SearchRequest();
    request.setComponentKeys(Collections.singletonList(PROJECT_KEY)).setRules(ImmutableList.of("typescript:" + ruleKey));
    return newWsClient().issues().search(request).getIssuesList()
      .stream().filter(issue -> issue.getComponent().endsWith(ruleKey + ".ts"))
      .collect(Collectors.toList());
  }

}
