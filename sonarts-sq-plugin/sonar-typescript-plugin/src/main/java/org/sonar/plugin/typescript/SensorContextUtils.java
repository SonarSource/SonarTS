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
package org.sonar.plugin.typescript;

import com.google.gson.JsonElement;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.annotation.Nullable;
import org.sonar.api.batch.fs.FilePredicate;
import org.sonar.api.batch.fs.FileSystem;
import org.sonar.api.batch.fs.InputFile;
import org.sonar.api.batch.sensor.SensorContext;
import org.sonar.api.batch.sensor.issue.NewIssue;
import org.sonar.api.batch.sensor.issue.NewIssueLocation;
import org.sonar.api.rule.RuleKey;
import org.sonar.api.utils.log.Logger;
import org.sonar.api.utils.log.Loggers;

public class SensorContextUtils {

  private static final Logger LOG = Loggers.get(SensorContextUtils.class);

  private static final Pattern UNREADABLE_CHARACTERS_PATTERN = Pattern.compile(
      // VT - Vertical Tab
    "\\u000B"
      // FF - Form Feed
      + "|\\u000C"
      // NEL - Next Line
      + "|\\u0085"
      // LS - Line Separator
      + "|\\u2028"
      // PS - Paragraph Separator
      + "|\\u2029");

  private SensorContextUtils() {
  }

  static void saveIssues(SensorContext sensorContext, Issue[] issues, TypeScriptRules typeScriptRules) {
    FileSystem fs = sensorContext.fileSystem();
    for (Issue issue : issues) {
      InputFile inputFile = fs.inputFile(fs.predicates().hasAbsolutePath(issue.name));
      if (inputFile != null) {
        saveIssue(sensorContext, typeScriptRules, issue, inputFile);
      }
    }
  }

  static void reportAnalysisErrors(SensorContext sensorContext, SensorContextUtils.AnalysisResponse response, InputFile inputFile) {
    for (Diagnostic diagnostic : response.diagnostics) {
      LOG.error("Compilation error at {}:{} \"{}\"", inputFile, diagnostic.line, diagnostic.message);
      LOG.error("File {} will be ignored", inputFile, diagnostic.message);
      sensorContext.newAnalysisError()
        .onFile(inputFile)
        .message(diagnostic.message)
        .at(inputFile.newPointer(diagnostic.line, diagnostic.col))
        .save();
    }
  }

  public static List<RuleToExecute> convertToRulesToExecute(TypeScriptRules typeScriptRules) {
    List<RuleToExecute> rulesToExecute = new ArrayList<>();

    typeScriptRules.forEach(rule -> {
      if(rule.isEnabled()) {
        rulesToExecute.add(new RuleToExecute(rule.tsLintKey(), rule.configuration()));
      }
    });

    return rulesToExecute;
  }

  static void setNodePath(File typescriptLocation, ProcessBuilder processBuilder) {
    Map<String, String> environment = processBuilder.environment();
    environment.put("NODE_PATH", typescriptLocation.getAbsolutePath() + File.pathSeparator + environment.getOrDefault("NODE_PATH", ""));
  }

  static void saveIssue(SensorContext sensorContext, TypeScriptRules typeScriptRules, Issue issue, InputFile inputFile) {
    RuleKey ruleKey = typeScriptRules.ruleKeyFromTsLintKey(issue.ruleName);
    NewIssue newIssue = sensorContext.newIssue().forRule(ruleKey);
    NewIssueLocation location = newIssue.newLocation();
    location.on(inputFile);
    location.message(issue.failure);

    // semicolon rule
    if (ruleKey.rule().equals("S1438")) {
      location.at(inputFile.selectLine(issue.startPosition.line + 1));

    } else if (!TypeScriptRules.FILE_LEVEL_RULES.contains(ruleKey.rule())) {
      location.at(inputFile.newRange(
        issue.startPosition.line + 1,
        issue.startPosition.character,
        issue.endPosition.line + 1,
        issue.endPosition.character));
    }

    newIssue.at(location);

    // there is not secondaryLocations for issues coming from tslint rules
    if (issue.secondaryLocations != null) {
      for (SecondaryLocation secondaryLocation : issue.secondaryLocations) {
        NewIssueLocation newSecondaryLocation = newIssue.newLocation().on(inputFile);
        setSecondaryLocation(newSecondaryLocation, secondaryLocation, inputFile);
        newIssue.addLocation(newSecondaryLocation);
      }
    }

    if (issue.cost != null) {
      newIssue.gap(issue.cost);
    }
    newIssue.save();
  }

  private static void setSecondaryLocation(NewIssueLocation newSecondaryLocation, SecondaryLocation secondaryLocation, InputFile inputFile) {
    newSecondaryLocation.at(inputFile.newRange(
      secondaryLocation.startLine + 1,
      secondaryLocation.startCol,
      secondaryLocation.endLine + 1,
      secondaryLocation.endCol));
    if (secondaryLocation.message != null) {
      newSecondaryLocation.message(secondaryLocation.message);
    }
  }

  static Iterable<InputFile> getInputFiles(SensorContext sensorContext) {
    FileSystem fileSystem = sensorContext.fileSystem();
    FilePredicate mainFilePredicate = sensorContext.fileSystem().predicates().and(
      fileSystem.predicates().hasType(InputFile.Type.MAIN),
      fileSystem.predicates().hasLanguage(TypeScriptLanguage.KEY));
    Iterable<InputFile> inputFiles = fileSystem.inputFiles(mainFilePredicate);
    return excludeInputFilesWithUnreadableCharacters(inputFiles);
  }

  static List<InputFile> excludeInputFilesWithUnreadableCharacters(Iterable<InputFile> inputFiles) {
    Map<String, Character> excludedFiles = new HashMap<>();
    List<InputFile> result = new ArrayList<>();
    for (InputFile inputFile : inputFiles) {
      try {
        String content = inputFile.contents();
        Matcher matcher = UNREADABLE_CHARACTERS_PATTERN.matcher(content);
        if (!matcher.find()) {
          result.add(inputFile);
        } else {
          excludedFiles.put(inputFile.filename(), content.charAt(matcher.start()));
        }
      } catch (IOException e) {
        // do nothing - analysis is done on TS side
      }
    }
    if (!excludedFiles.isEmpty()) {
      LOG.warn(String.format("Excluding %d file(s) because of unrecognized NEW_LINE characters:", excludedFiles.size()));
      excludedFiles.forEach((fileName, invalidCharacter) -> LOG.warn(String.format(" - %s ('\\u%04x')", fileName, (int) invalidCharacter)));
    }
    return result;
  }

  static class Issue {
    String failure;
    Position startPosition;
    Position endPosition;
    String name;
    String ruleName;
    SecondaryLocation[] secondaryLocations;
    Double cost;

    @Override
    public String toString() {
      return failure + "\n start " + startPosition + "\n end " + endPosition + "\n name " + name + "\n ruleName " + ruleName + "\n cost " + cost;
    }
  }

  static class Position {
    Integer line;
    Integer character;

    public Position(Integer line, Integer character) {
      this.line = line;
      this.character = character;
    }

    @Override
    public String toString() {
      return "[" + line + "," + character + "]";
    }
  }

  private static class SecondaryLocation {
    Integer startLine;
    Integer startCol;
    Integer endLine;
    Integer endCol;
    String message;
  }

  static class AnalysisResponse {
    String filepath;
    Issue[] issues = {};
    Highlight[] highlights = {};
    CpdToken[] cpdTokens = {};
    Symbol[] symbols = {};
    Diagnostic[] diagnostics = {};
    int[] ncloc = {};
    int[] commentLines = {};
    Integer[] nosonarLines = {};
    int[] executableLines = {};
    int functions = 0;
    int statements = 0;
    int classes = 0;
    int complexity = 0;
    int cognitiveComplexity = 0;

    boolean hasDiagnostics() {
      return diagnostics.length > 0;
    }
  }

  static class Highlight {
    Integer startLine;
    Integer startCol;
    Integer endLine;
    Integer endCol;
    String textType;
  }

  static class CpdToken {
    Integer startLine;
    Integer startCol;
    Integer endLine;
    Integer endCol;
    String image;
  }

  static class Symbol {
    Integer startLine;
    Integer startCol;
    Integer endLine;
    Integer endCol;
    SymbolReference[] references;
  }

  static class SymbolReference {
    Integer startLine;
    Integer startCol;
    Integer endLine;
    Integer endCol;
  }

  static class Diagnostic {
    String message;
    Integer line;
    Integer col;
  }

  static class ContextualAnalysisRequest {
    String file;
    String content;
    List<RuleToExecute> rules;
    String projectRoot;
    @Nullable
    String tsconfigPath;

    ContextualAnalysisRequest(InputFile inputFile, TypeScriptRules typeScriptRules, String projectRoot, @Nullable String tsconfigPath) throws IOException {
      Path path = Paths.get(inputFile.uri());
      this.file = path.toString();
      this.content = inputFile.contents();
      this.rules = SensorContextUtils.convertToRulesToExecute(typeScriptRules);
      this.projectRoot = projectRoot;
      if (tsconfigPath != null) {
        this.tsconfigPath = new File(projectRoot, tsconfigPath).getAbsolutePath();
      } else {
        this.tsconfigPath = null;
      }
    }
  }

  public static class RuleToExecute {
    final String ruleName;
    final JsonElement ruleArguments;

    public RuleToExecute(String ruleName, JsonElement ruleArguments) {
      this.ruleName = ruleName;
      this.ruleArguments = ruleArguments;
    }
  }

}
