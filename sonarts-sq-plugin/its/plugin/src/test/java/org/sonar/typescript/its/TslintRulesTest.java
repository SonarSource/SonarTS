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
  public void should_avoid_escape_in_quote_rule() {
    assertIssueLines("S1441", "profile-single-quotes", ImmutableList.of(1));
    assertIssueLines("S1441", "profile-double-quotes", ImmutableList.of(3));
  }

  private void assertIssueLines(String ruleKey, String profileKey, List<Integer> expectedLines) {
    orchestrator.resetData();
    orchestrator.executeBuild(Tests.createScanner("projects/tslint-rules-test-project", PROJECT_KEY).setProfile(profileKey));

    SearchRequest request = new SearchRequest();
    request.setComponentKeys(Collections.singletonList(PROJECT_KEY)).setRules(ImmutableList.of("typescript:" + ruleKey));
    List<Issue> issuesList = newWsClient().issues().search(request).getIssuesList();
    assertThat(issuesList).extracting("line").containsExactlyElementsOf(expectedLines);
  }

}
