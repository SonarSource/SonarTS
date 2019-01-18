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
package org.sonar.plugin.typescript.externalreport;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.reflect.Type;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.annotation.Nullable;
import org.junit.BeforeClass;
import org.junit.Test;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;

public class TslintRulesTest {

  private static final String TSLINT_RULES_JSON_PATH = "/org/sonar/l10n/typescript/rules/tslint/rules.json";
  private static final String TSLINT_SONARTS_RULES_JSON_PATH = "/org/sonar/l10n/typescript/rules/tslint-sonarts/rules.json";
  private static final Path README_PATH = Paths.get("..", "..", "README.md");
  private static final Path SONAR_TS_RULES_PATH = Paths.get("..", "..", "sonarts-core", "src", "rules");
  private static final Path JAVA_ANNOTATED_RULES_PATH = Paths.get("src", "main", "java", "org", "sonar", "plugin", "typescript", "rules");

  private static Set<String> javaAnnotatedRuleTsLintKeys;
  private static Map<String, Rule> ruleByTsLintKeyFromReadMe;
  private static Map<String, Rule> ruleByTsLintKeyFromSonarTS;
  private static Map<String, Rule> ruleByTsLintKeyFromTsLintJson;
  private static Map<String, Rule> ruleByTsLintKeyFromTsLintSonarTsJson;
  private static Set<String> bugTslintRules;

  @BeforeClass
  public static void beforeClass() throws IOException {
    javaAnnotatedRuleTsLintKeys = new JavaAnnotatedRules(JAVA_ANNOTATED_RULES_PATH).ruleTsLintKeys;
    ruleByTsLintKeyFromReadMe = new ReadMeRules(README_PATH).ruleByTsLintKey;
    ruleByTsLintKeyFromSonarTS = new SonarTsRules(SONAR_TS_RULES_PATH).ruleByTsLintKey;
    ruleByTsLintKeyFromTsLintJson = loadJson(TSLINT_RULES_JSON_PATH);
    ruleByTsLintKeyFromTsLintSonarTsJson = loadJson(TSLINT_SONARTS_RULES_JSON_PATH);
    bugTslintRules = new HashSet<>(Arrays.asList(
      "await-promise",
      "ban-comma-operator",
      "ban",
      "curly",
      "forin",
      "import-blacklist",
      "label-position",
      "no-arg",
      "no-bitwise",
      "no-conditional-assignment",
      "no-console",
      "no-construct",
      "no-debugger",
      "no-duplicate-super",
      "no-duplicate-switch-case",
      "no-duplicate-variable",
      "no-dynamic-delete",
      "no-empty",
      "no-eval",
      "no-floating-promises",
      "no-for-in-array",
      "no-implicit-dependencies",
      "no-inferred-empty-object-type",
      "no-invalid-template-strings",
      "no-invalid-this",
      "no-misused-new",
      "no-null-keyword",
      "no-object-literal-type-assertion",
      "no-return-await",
      "no-shadowed-variable",
      "no-sparse-arrays",
      "no-string-literal",
      "no-string-throw",
      "no-submodule-imports",
      "no-switch-case-fall-through",
      "no-this-assignment",
      "no-unbound-method",
      "no-unnecessary-class",
      "no-unsafe-any",
      "no-unsafe-finally",
      "no-unused-expression",
      "no-unused-variable",
      "no-use-before-declare",
      "no-var-keyword",
      "no-void-expression",
      "prefer-conditional-expression",
      "prefer-object-spread",
      "radix",
      "restrict-plus-operands",
      "strict-boolean-expressions",
      "strict-type-predicates",
      "switch-default",
      "triple-equals",
      "typeof-compare",
      "use-default-type-parameter",
      "use-isnan"));
  }

  @Test
  public void all_java_annotated_rules_exist_in_tslint_rules_json() {
    Set<String> missingTsLintKeys = new HashSet<>(javaAnnotatedRuleTsLintKeys);
    missingTsLintKeys.removeAll(ruleByTsLintKeyFromTsLintJson.keySet());
    assertThat(missingTsLintKeys).isEmpty();
  }

  @Test
  public void none_java_annotated_rules_exists_in_sonar_ts_rules() {
    Set<String> missingTsLintKeys = new HashSet<>(javaAnnotatedRuleTsLintKeys);
    missingTsLintKeys.retainAll(ruleByTsLintKeyFromSonarTS.keySet());
    assertThat(missingTsLintKeys).isEmpty();
  }

  @Test
  public void all_readme_rules_exist_in_rules_json() {
    Set<String> missingTsLintKeys = new HashSet<>(ruleByTsLintKeyFromReadMe.keySet());
    missingTsLintKeys.removeAll(ruleByTsLintKeyFromTsLintSonarTsJson.keySet());
    assertThat(missingTsLintKeys).isEmpty();
  }

  @Test
  public void readme_matches_sonar_ts_rules() {
    assertThat(ruleByTsLintKeyFromReadMe.keySet()).isEqualTo(ruleByTsLintKeyFromSonarTS.keySet());

    String readMe = ruleByTsLintKeyFromReadMe.values().stream()
      .sorted(Comparator.comparing(rule -> rule.key))
      .map(rule -> rule.key + ": " + rule.name)
      .collect(Collectors.joining("\n"));

    String sonarTS = ruleByTsLintKeyFromSonarTS.values().stream()
      .sorted(Comparator.comparing(rule -> rule.key))
      .map(rule -> rule.key + ": " + rule.name)
      .collect(Collectors.joining("\n"));

    assertThat(readMe).isEqualTo(sonarTS);
  }

  @Test
  public void tslint_sonarts_rules_json_contains_readme_rules() {
    Gson gson = new GsonBuilder().setPrettyPrinting().create();

    String readMe = gson.toJson(ruleByTsLintKeyFromReadMe.values().stream()
      .sorted(Comparator.comparing(rule -> rule.key))
      .collect(Collectors.toList()));

    String rulesJson = gson.toJson(ruleByTsLintKeyFromTsLintSonarTsJson.values().stream()
      .sorted(Comparator.comparing(rule -> rule.key))
      .collect(Collectors.toList()));

    assertThat(rulesJson).isEqualTo(readMe);
  }

  @Test
  public void tslint_rules_json_check_rule_type() {
    Gson gson = new GsonBuilder().setPrettyPrinting().create();

    String actual = gson.toJson(new ArrayList<>(ruleByTsLintKeyFromTsLintJson.values()));

    String expected = gson.toJson(ruleByTsLintKeyFromTsLintJson.values().stream()
      .map(rule -> new Rule(rule).withType(bugTslintRules.contains(rule.key) ? "BUG" : "CODE_SMELL"))
      .collect(Collectors.toList()));

    assertThat(actual).isEqualTo(expected);
  }

  private static Map<String, Rule> loadJson(String classPath) throws IOException {
    Type ruleListType = new TypeToken<List<Rule>>() {}.getType();
    try (InputStream in = TslintRulesTest.class.getResourceAsStream(classPath)) {
      List<Rule> rules = new Gson().fromJson(new InputStreamReader(in), ruleListType);
      return rules.stream().collect(Collectors.toMap(rule -> rule.key, Function.identity()));
    }
  }

  static class Rule {
    String key;
    String name;
    String type;
    String url;

    Rule() {
    }

    Rule(Rule other) {
      this.key = other.key;
      this.name = other.name;
      this.type = other.type;
      this.url = other.url;
    }

    Rule withKey(@Nullable String key) {
      this.key = key;
      return this;
    }

    Rule withName(@Nullable String name) {
      this.name = name;
      return this;
    }

    Rule withType(@Nullable String type) {
      this.type = type;
      return this;
    }
  }

  static class JavaAnnotatedRules {

    private static final Pattern RULE_ANNOTATION = Pattern.compile("^@Rule", Pattern.MULTILINE);

    private static final Pattern TS_LINT_KEY = Pattern.compile("^\\s+public String tsLintKey()\\s*\\{\\s*return\\s*\"(?<key>[^\"]+)\"");

    final Set<String> ruleTsLintKeys;

    JavaAnnotatedRules(Path sourcePath) throws IOException {
      ruleTsLintKeys = new HashSet<>();
      List<Path> pathWithJavaExtension;
      try (Stream<Path> paths = Files.walk(sourcePath)) {
        pathWithJavaExtension = paths
          .filter(Files::isRegularFile)
          .filter(path -> path.toString().endsWith(".java"))
          .collect(Collectors.toList());
      }
      for (Path path : pathWithJavaExtension) {
        String content = new String(Files.readAllBytes(path), UTF_8);
        Matcher matcher = TS_LINT_KEY.matcher(content);
        if (matcher.find() && RULE_ANNOTATION.matcher(content).find()) {
          ruleTsLintKeys.add(matcher.group("key"));
        }
      }
    }
  }

  static class ReadMeRules {

    private static final Pattern RULE_PATTERN = Pattern.compile("^###.*|\\* (?<name>.*)\\(\\[`(?<key>[^` ]+)`]\\)", Pattern.MULTILINE);
    private static final Pattern URL_PATTERN = Pattern.compile("^\\[`(?<key>[^` ]+)`]: \\./(?<url>sonarts-core/[^ ]+\\.md) *$", Pattern.MULTILINE);

    final Path readmePath;
    final Map<String, Rule> ruleByTsLintKey;

    ReadMeRules(Path readmePath) throws IOException {
      this.readmePath = readmePath;
      this.ruleByTsLintKey = new LinkedHashMap<>();
      String content = new String(Files.readAllBytes(readmePath), UTF_8);
      parseKeyAndName(content);
      parseKeyAndUrl(content);

      List<String> ruleWithoutUrls = ruleByTsLintKey.values().stream()
        .filter(rule -> rule.url == null)
        .map(rule -> rule.key)
        .collect(Collectors.toList());

      assertThat(ruleWithoutUrls).isEmpty();
    }

    private void parseKeyAndName(String content) {
      String ruleType = null;
      Matcher matcher = RULE_PATTERN.matcher(content);
      while (matcher.find()) {
        String line = matcher.group();
        if (line.startsWith("### Code Smell Detection")) {
          ruleType = "CODE_SMELL";
        } else if (line.startsWith("### Bug Detection")) {
          ruleType = "BUG";
        } else if (line.startsWith("###")) {
          ruleType = null;
        } else if (ruleType != null) {
          Rule rule = new Rule()
            .withKey(matcher.group("key"))
            .withName(matcher.group("name").replace('`', '"').trim())
            .withType(ruleType);
          ruleByTsLintKey.put(rule.key, rule);
        }
      }
    }

    private void parseKeyAndUrl(String content) {
      Matcher matcher = URL_PATTERN.matcher(content);
      while (matcher.find()) {
        String key = matcher.group("key");
        String url = matcher.group("url");
        Rule rule = ruleByTsLintKey.get(key);
        if (rule == null) {
          throw new IllegalStateException("In " + readmePath + ", missing rule name for key: " + key + ", url: " + url);
        }
        rule.url = "https://github.com/SonarSource/SonarTS/blob/master/" + url;
      }
    }

  }

  static class SonarTsRules {

    private static final List<String> STRING_SEPARATOR = Arrays.asList("'", "\"", "`");

    private static final List<Pattern> RULE_NAME = STRING_SEPARATOR.stream()
      .map(quote -> "^\\s*ruleName:\\s*" + quote + "(?<value>[^" + quote + "]+)" + quote + ",\\s*$")
      .map(pattern -> Pattern.compile(pattern, Pattern.MULTILINE))
      .collect(Collectors.toList());

    private static final List<Pattern> RULE_DESC = STRING_SEPARATOR.stream()
      .map(quote -> "^\\s*description:\\s*" + quote + "(?<value>[^" + quote + "]*)" + quote + ",\\s*$")
      .map(pattern -> Pattern.compile(pattern, Pattern.MULTILINE))
      .collect(Collectors.toList());

    final Map<String, Rule> ruleByTsLintKey;

    SonarTsRules(Path sourcePath) throws IOException {
      ruleByTsLintKey = new LinkedHashMap<>();
      List<Path> pathsWithTSExtension;
      try (Stream<Path> paths = Files.walk(sourcePath.toRealPath())) {
        pathsWithTSExtension = paths
          .filter(Files::isRegularFile)
          .filter(path -> path.toString().endsWith(".ts"))
          .collect(Collectors.toList());
      }
      for (Path path : pathsWithTSExtension) {
        String content = new String(Files.readAllBytes(path), UTF_8);
        Rule rule = new Rule()
          .withKey(extractValue(RULE_NAME, content))
          .withName(extractValue(RULE_DESC, content));
        if (rule.key != null && rule.name != null) {
          ruleByTsLintKey.put(rule.key, rule);
        } else if (rule.key != null) {
          throw new IllegalStateException("Missing 'description' for ruleName: " + rule.key + ",  path: " + path);
        }
      }
    }

    @Nullable
    private static String extractValue(List<Pattern> patterns, String content) {
      return patterns.stream()
        .map(pattern -> pattern.matcher(content))
        .filter(Matcher::find)
        .map(matcher -> matcher.group("value"))
        .findFirst().orElse(null);
    }

  }

}
