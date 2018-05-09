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

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.jar.JarFile;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.junit.runners.Parameterized.Parameter;
import org.junit.runners.Parameterized.Parameters;
import org.sonar.api.batch.fs.InputFile;
import org.sonar.api.batch.fs.internal.TestInputFileBuilder;
import org.sonar.api.batch.rule.ActiveRules;
import org.sonar.api.batch.rule.CheckFactory;
import org.sonar.api.batch.rule.Checks;
import org.sonar.api.batch.rule.internal.ActiveRulesBuilder;
import org.sonar.api.batch.rule.internal.NewActiveRule;
import org.sonar.api.batch.sensor.internal.SensorContextTester;
import org.sonar.api.batch.sensor.issue.Issue;
import org.sonar.api.config.Configuration;
import org.sonar.api.issue.NoSonarFilter;
import org.sonar.api.measures.FileLinesContext;
import org.sonar.api.measures.FileLinesContextFactory;
import org.sonar.api.rule.RuleKey;
import org.sonar.check.Rule;
import org.sonar.plugin.typescript.ExternalProcessStreamConsumer;
import org.sonar.plugin.typescript.ExternalTypescriptSensor;
import org.sonar.plugin.typescript.TypeScriptLanguage;
import org.sonar.plugin.typescript.TypeScriptRules;
import org.sonar.plugin.typescript.TypeScriptRulesDefinition;
import org.sonar.plugin.typescript.executable.ExecutableBundle;
import org.sonar.plugin.typescript.executable.ExecutableBundleFactory;
import org.sonar.plugin.typescript.executable.SonarTSCoreBundle;
import org.sonar.plugin.typescript.executable.Zip;
import org.sonar.plugin.typescript.rules.TypeScriptRule;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

/**
 * This test reads all the available rules in the SQ plugin via reflection and runs the plugin on the test file used for sonarts-core unit test (*.lint.ts file)
 * Note that only issues lines are compared!
 */
@RunWith(Parameterized.class)
public class JavaRulesIntegrationTest {

  private static final Path SONARTS_LINT_FILES = Paths.get("../../../sonarts-core/tests/rules");
  private static final Path TSLINT_TEST_FILE = Paths.get("src/test/resources/fixtures");

  private static final Pattern ERROR_COMMENT = Pattern.compile(".*//.*\\^+\\s*\\{\\{.*}}.*");
  private static final Pattern MULTILINE_ERROR_COMMENT = Pattern.compile(".*//\\s*\\[(\\d+):(\\d+)-(\\d+):(\\d+)]\\s*\\{\\{.*");
  private static final String FIXTURE_FILENAME = "fixture.ts";
  private static final byte[] TSCONFIG = ("{" +
    "  \"compilerOptions\": {\n" +
    "    \"strict\": true,\n" +
    "    \"target\": \"esnext\"\n" +
    "  },\n" +
    "  \"include\": [\"" + FIXTURE_FILENAME + "\"]\n" +
    "}").getBytes(StandardCharsets.UTF_8);

  // for some rules we don't have test file available, skip those
  private static final Set<String> MISSING_TEST_FILE = new HashSet<>(Arrays.asList(
    "S103", "S104", "S105", "S109", "S113", "S117", "S121", "S878", "S905", "S1105", "S1121", "S1143", "S1438", "S1439", "S1440", "S1441", "S1451", "S1523", "S1524",
    "S1525", "S1874", "S2228", "S2685", "S2688", "S2814", "S2933", "S2966", "S3257", "S3353", "S3402", "S3498", "S3504", "S3512", "S3533", "S3696", "S3786", "S3854",
    "S3863", "S4023", "S4123", "S4124", "S4136", "S4137", "S4138", "S4139", "S4140", "S4156", "S4157", "S4204", "S4326", "S4327", "S4328"
  ));

  @ClassRule
  public static TemporaryFolder temp = new TemporaryFolder();

  private static File projectDir;
  private static File workDir;
  private SensorContextTester sensorContext;
  private static ExternalProcessStreamConsumer errorConsumer;
  private static ExecutableBundleFactory executableBundleFactory;
  private static FileLinesContextFactory fileLinesContextFactory;
  private static NoSonarFilter noSonarFilter;

  @Parameter(0)
  public String ruleKey;

  @Parameter(1)
  public String tsLintRule;

  @Parameters(name = "{0}:{1}")
  public static Collection<Object[]> data() {
    return TypeScriptRules.getRuleClasses().stream()
      .map(ruleClass -> new Object[]{ruleKeyFromClass(ruleClass), tslintKeyFromClass(ruleClass)})
      .filter(arr -> !MISSING_TEST_FILE.contains(arr[0]))
      .collect(Collectors.toList());
  }

  private static String tslintKeyFromClass(Class<? extends TypeScriptRule> ruleClass) {
    try {
      return ruleClass.newInstance().tsLintKey();
    } catch (InstantiationException | IllegalAccessException e) {
      throw new IllegalStateException(e);
    }
  }

  private static String ruleKeyFromClass(Class<? extends TypeScriptRule> ruleClass) {
    return ((Rule) ruleClass.getAnnotations()[0]).key();
  }

  @BeforeClass
  public static void setUp() throws Exception {
    projectDir = temp.newFolder();
    workDir = temp.newFolder();
    Tests.runNPMInstall(projectDir, "typescript", "--no-save");
    Files.write(projectDir.toPath().resolve("tsconfig.json"), TSCONFIG);

    errorConsumer = new ExternalProcessStreamConsumer();
    errorConsumer.start();
    prepareBundle();
    executableBundleFactory = JavaRulesIntegrationTest::createAndDeploy;
    fileLinesContextFactory = (inputFile) -> mock(FileLinesContext.class);
    noSonarFilter = mock(NoSonarFilter.class);
  }

  private static void prepareBundle() {
    File file = Tests.PLUGIN_LOCATION.getFile();
    try (JarFile jar = new JarFile(file)) {
      ZipEntry entry = jar.getEntry("sonarts-bundle.zip");
      InputStream inputStream = jar.getInputStream(entry);
      Zip.extract(inputStream, workDir);
    } catch (Exception e) {
      throw new IllegalStateException("Failed to extract bundle", e);
    }
  }

  private static ExecutableBundle createAndDeploy(File deployDestination, Configuration configuration) {
    return new SonarTSCoreBundle(new File(workDir, "sonarts-bundle"), configuration);
  }

  @Test
  public void test() throws Exception {
    sensorContext = SensorContextTester.create(projectDir);
    sensorContext.fileSystem().setWorkDir(workDir.toPath());

    Path lintFile = lintFile(tsLintRule);
    String testFixture = new String(Files.readAllBytes(lintFile));
    createInputFile(testFixture);

    CheckFactory checkFactory = getCheckFactory(ruleKey);
    ExternalTypescriptSensor sensor = new ExternalTypescriptSensor(executableBundleFactory, noSonarFilter, fileLinesContextFactory, checkFactory, errorConsumer);
    sensor.execute(sensorContext);

    List<Integer> expectedLines = expectedIssues(testFixture);
    assertThat(expectedLines).isNotEmpty();

    assertThat(sensorContext.allIssues().stream().allMatch(i -> i.ruleKey().rule().equals(ruleKey))).isTrue();
    List<Integer> actualIssues = sensorContext.allIssues().stream().map(JavaRulesIntegrationTest::issueLine).sorted().collect(Collectors.toList());
    assertThat(actualIssues).isEqualTo(expectedLines);
  }

  /**
   * See runRule.ts#parseErrorsFromMarkup in sonarts-core
   */
  private List<Integer> expectedIssues(String testFixture) {
    String[] lines = testFixture.split("\n");
    List<Integer> expectedLines = new ArrayList<>();
    for (int i = 0; i < lines.length; i++) {
      if (ERROR_COMMENT.matcher(lines[i]).matches()) {
        expectedLines.add(i);
      } else {
        Matcher matcher = MULTILINE_ERROR_COMMENT.matcher(lines[i]);
        if (matcher.matches()) {
          int startLine = Integer.valueOf(matcher.group(1));
          expectedLines.add(startLine);
        }
      }
    }
    expectedLines.sort(null);
    return expectedLines;
  }

  private static int issueLine(Issue i) {
    return i.primaryLocation().textRange().start().line();
  }

  private Path lintFile(String tslintRule) {
    String ruleFile = ruleNameToLintFilename(tslintRule);
    Path sonarTsLintFile = SONARTS_LINT_FILES.resolve(ruleFile).resolve(ruleFile + ".lint.ts");
    if (Files.exists(sonarTsLintFile)) {
      return sonarTsLintFile;
    }
    sonarTsLintFile = SONARTS_LINT_FILES.resolve(ruleFile).resolve(ruleFile + ".lint.tsx");
    if (Files.exists(sonarTsLintFile)) {
      return sonarTsLintFile;
    }
    Path tslintTestFile = TSLINT_TEST_FILE.resolve(ruleFile + ".lint.ts");
    if (Files.exists(tslintTestFile)) {
      return tslintTestFile;
    }
    throw new IllegalStateException("Test fixture not found. Tried:\n" + sonarTsLintFile + "\n" + tslintTestFile);
  }

  private String ruleNameToLintFilename(String tslintRule) {
    StringBuilder sb = new StringBuilder();
    boolean makeUpper = false;
    for (char c : tslintRule.toCharArray()) {
      if (c == '-') {
        makeUpper = true;
      } else {
        sb.append(makeUpper ? Character.toUpperCase(c) : c);
        makeUpper = false;
      }
    }
    sb.append("Rule");
    return sb.toString();
  }

  private void createInputFile(String content) throws IOException {
    File filePath = new File(projectDir, FIXTURE_FILENAME);
    Files.write(filePath.toPath(), content.getBytes(StandardCharsets.UTF_8));
    InputFile inputFile = TestInputFileBuilder.create("module", projectDir, filePath)
      .setLanguage(TypeScriptLanguage.KEY)
      .setContents(content)
      .build();
    sensorContext.fileSystem().add(inputFile);
  }

  private CheckFactory getCheckFactory(String activeRule) {
    List<Class<? extends TypeScriptRule>> ruleClasses = TypeScriptRules.getRuleClasses();
    List<String> allKeys = ruleClasses.stream().map(JavaRulesIntegrationTest::ruleKeyFromClass).collect(Collectors.toList());
    ActiveRulesBuilder rulesBuilder = new ActiveRulesBuilder();
    allKeys.forEach(key -> {
      NewActiveRule newActiveRule = rulesBuilder.create(RuleKey.of(TypeScriptRulesDefinition.REPOSITORY_KEY, key));
      if (activeRule.equals(key)) {
        newActiveRule.activate();
      }
    });
    ActiveRules activeRules = rulesBuilder.build();
    CheckFactory checkFactory = new CheckFactory(activeRules);
    Checks<TypeScriptRule> checks = checkFactory.create(TypeScriptRulesDefinition.REPOSITORY_KEY);
    checks.addAnnotatedChecks(ruleClasses);
    return checkFactory;
  }
}
