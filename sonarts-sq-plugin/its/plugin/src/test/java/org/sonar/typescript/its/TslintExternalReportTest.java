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
import com.sonar.orchestrator.build.SonarScanner;
import java.util.Collections;
import java.util.List;
import org.junit.ClassRule;
import org.junit.Test;
import org.sonarqube.ws.Issues.Issue;
import org.sonarqube.ws.client.issues.SearchRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;
import static org.sonar.typescript.its.Tests.newWsClient;

public class TslintExternalReportTest {

  private static final String PROJECT_KEY = "SonarTS-tslint-report-test";

  @ClassRule
  public static Orchestrator orchestrator = Tests.ORCHESTRATOR;

  @Test
  public void should_save_issues_from_external_report() {
    if (sqSupportsExternalIssues()) {
      orchestrator.resetData();
      SonarScanner build = Tests.createScanner("projects/tslint-report-project", PROJECT_KEY, "empty-profile");
      build.setProperty("sonar.typescript.tslint.reportPaths", "report.json");
      orchestrator.executeBuild(build);

      SearchRequest request = new SearchRequest();
      request.setComponentKeys(Collections.singletonList(PROJECT_KEY));
      List<Issue> issuesList = newWsClient().issues().search(request).getIssuesList();
      assertThat(issuesList).extracting(Issue::getLine, Issue::getRule).containsExactlyInAnyOrder(
        tuple(7, "external_tslint_repo:curly"),
        tuple(5, "external_tslint_repo:prefer-const"),
        tuple(5, "external_tslint_repo:semicolon"),
        tuple(3, "external_tslint_repo:no-unused-expression"));
    }
  }

  public static boolean sqSupportsExternalIssues() {
    return orchestrator.getServer().version().isGreaterThanOrEquals(7, 2);
  }
}
