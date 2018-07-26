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
