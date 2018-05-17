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
import com.sonar.orchestrator.build.SonarScanner;
import java.util.Collections;
import java.util.List;
import org.junit.ClassRule;
import org.junit.Test;
import org.sonarqube.ws.Issues.Issue;
import org.sonarqube.ws.client.issues.SearchRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.sonar.typescript.its.Tests.newWsClient;

public class EslintExternalReportTest {

  private static final String PROJECT_KEY = "SonarTS-eslint-report-test";

  @ClassRule
  public static Orchestrator orchestrator = Tests.ORCHESTRATOR;

  @Test
  public void should_save_issues_from_external_report() {
    if (sqSupportsExternalIssues()) {
      orchestrator.resetData();
      SonarScanner build = Tests.createScanner("projects/eslint-report-project", PROJECT_KEY);
      build.setProperty("sonar.typescript.eslint.reportPaths", "report.json");
      orchestrator.executeBuild(build);

      SearchRequest request = new SearchRequest();
      request.setComponentKeys(Collections.singletonList(PROJECT_KEY));
      List<Issue> issuesList = newWsClient().issues().search(request).getIssuesList();
      assertThat(issuesList).extracting("line").containsExactlyInAnyOrder(1, 2, 3, 5, 7);
      assertThat(issuesList).extracting("rule").containsExactlyInAnyOrder(
        "external_eslint:no-unused-vars",
        "external_eslint:no-extra-semi",
        "external_eslint:use-isnan",
        "external_eslint:semi",
        "external_eslint:semi");
    }
  }

  public static boolean sqSupportsExternalIssues() {
    return orchestrator.getConfiguration().getSonarVersion().isGreaterThanOrEquals("7.2");
  }
}
