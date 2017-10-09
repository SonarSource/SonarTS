/*
 * SonarTS
 * Copyright (C) 2017-2017 SonarSource SA
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

import com.google.common.collect.ArrayListMultimap;
import com.google.common.collect.Iterables;
import com.google.common.collect.Multimap;
import com.google.common.collect.Sets;
import com.google.gson.Gson;
import java.io.File;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import javax.annotation.Nullable;
import org.sonar.api.batch.fs.FilePredicate;
import org.sonar.api.batch.fs.FileSystem;
import org.sonar.api.batch.fs.InputFile;
import org.sonar.api.batch.rule.CheckFactory;
import org.sonar.api.batch.sensor.Sensor;
import org.sonar.api.batch.sensor.SensorContext;
import org.sonar.api.batch.sensor.SensorDescriptor;
import org.sonar.api.batch.sensor.cpd.NewCpdTokens;
import org.sonar.api.batch.sensor.highlighting.NewHighlighting;
import org.sonar.api.batch.sensor.highlighting.TypeOfText;
import org.sonar.api.batch.sensor.issue.NewIssue;
import org.sonar.api.batch.sensor.issue.NewIssueLocation;
import org.sonar.api.issue.NoSonarFilter;
import org.sonar.api.measures.CoreMetrics;
import org.sonar.api.measures.FileLinesContext;
import org.sonar.api.measures.FileLinesContextFactory;
import org.sonar.api.measures.Metric;
import org.sonar.api.rule.RuleKey;
import org.sonar.api.utils.command.Command;
import org.sonar.api.utils.log.Logger;
import org.sonar.api.utils.log.Loggers;
import org.sonar.plugin.typescript.executable.ExecutableBundle;
import org.sonar.plugin.typescript.executable.ExecutableBundleFactory;
import org.sonar.plugin.typescript.rules.TypeScriptRules;

public class ExternalTypescriptSensor implements Sensor {

  private static final Logger LOG = Loggers.get(ExternalTypescriptSensor.class);
  private final CheckFactory checkFactory;

  private ExecutableBundleFactory executableBundleFactory;
  private NoSonarFilter noSonarFilter;
  private FileLinesContextFactory fileLinesContextFactory;

  /**
   * ExecutableBundleFactory is injected for testability purposes
   */
  public ExternalTypescriptSensor(
    ExecutableBundleFactory executableBundleFactory, NoSonarFilter noSonarFilter, FileLinesContextFactory fileLinesContextFactory,
    CheckFactory checkFactory) {
    this.executableBundleFactory = executableBundleFactory;
    this.noSonarFilter = noSonarFilter;
    this.fileLinesContextFactory = fileLinesContextFactory;
    this.checkFactory = checkFactory;
  }

  @Override
  public void describe(SensorDescriptor sensorDescriptor) {
    sensorDescriptor.onlyOnLanguage(TypeScriptLanguage.KEY).name("TypeScript Sensor").onlyOnFileType(InputFile.Type.MAIN);
  }

  @Override
  public void execute(SensorContext sensorContext) {
    File deployDestination = sensorContext.fileSystem().workDir();
    File typescriptLocation = getTypescriptLocation(sensorContext.fileSystem().baseDir());

    ExecutableBundle executableBundle = executableBundleFactory.createAndDeploy(deployDestination);

    FileSystem fileSystem = sensorContext.fileSystem();
    FilePredicate mainFilePredicate = sensorContext.fileSystem().predicates().and(
      fileSystem.predicates().hasType(InputFile.Type.MAIN),
      fileSystem.predicates().hasLanguage(TypeScriptLanguage.KEY));
    Iterable<InputFile> inputFiles = fileSystem.inputFiles(mainFilePredicate);

    LOG.info("Metrics calculation");
    runMetrics(inputFiles, sensorContext, executableBundle, typescriptLocation);

    LOG.info("Rules execution");
    TypeScriptRules typeScriptRules = new TypeScriptRules(checkFactory);
    executableBundle.activateRules(typeScriptRules);
    runRules(inputFiles, executableBundle, sensorContext, typeScriptRules, deployDestination, typescriptLocation);

  }

  private void runRules(Iterable<InputFile> inputFiles, ExecutableBundle executableBundle, SensorContext sensorContext, TypeScriptRules typeScriptRules, File deployDestination, @Nullable File typescriptLocation) {
    File projectBaseDir = sensorContext.fileSystem().baseDir();

    Multimap<String, InputFile> inputFileByTsconfig = getInputFileByTsconfig(inputFiles, projectBaseDir);

    for (String tsconfigPath : inputFileByTsconfig.keySet()) {
      Collection<InputFile> inputFilesForThisConfig = inputFileByTsconfig.get(tsconfigPath);

      Command command = executableBundle.getRuleRunnerCommand(tsconfigPath, inputFilesForThisConfig);
      Failure[] failures = Arrays.stream(executeExternalRunner(command, inputFilesForThisConfig, typescriptLocation)).flatMap(response -> Arrays.stream(response.issues)).toArray(Failure[]::new);
      saveFailures(sensorContext, failures, typeScriptRules);
    }
  }

  private static Multimap<String, InputFile> getInputFileByTsconfig(Iterable<InputFile> inputFiles, File projectBaseDir) {
    Multimap<String, InputFile> inputFileByTsconfig = ArrayListMultimap.create();

    for (InputFile inputFile : inputFiles) {
      File tsConfig = findTsConfig(inputFile, projectBaseDir);
      if (tsConfig == null) {
        LOG.error("No tsconfig.json file found for " + inputFile.absolutePath() + " (looking up the directories tree). This file will not be analyzed.");
      } else {
        inputFileByTsconfig.put(tsConfig.getAbsolutePath(), inputFile);
      }
    }
    return inputFileByTsconfig;
  }

  @Nullable
  private static File findTsConfig(InputFile inputFile, File projectBaseDir) {
    File currentDirectory = inputFile.file();
    do {
      currentDirectory = currentDirectory.getParentFile();
      File tsconfig = new File(currentDirectory, "tsconfig.json");
      if (tsconfig.exists()) {
        return tsconfig;
      }
    } while (!currentDirectory.getAbsolutePath().equals(projectBaseDir.getAbsolutePath()));
    return null;
  }

  private void runMetrics(Iterable<InputFile> inputFiles, SensorContext sensorContext, ExecutableBundle executableBundle, @Nullable File typescriptLocation) {

    SonarTSRunnerResponse[] sonarTSRunnerResponses = executeExternalRunner(executableBundle.getTsMetricsCommand(), inputFiles, typescriptLocation);

    for (SonarTSRunnerResponse sonarTSRunnerResponse : sonarTSRunnerResponses) {
      FileSystem fileSystem = sensorContext.fileSystem();
      InputFile inputFile = fileSystem.inputFile(fileSystem.predicates().hasAbsolutePath(sonarTSRunnerResponse.filepath));
      if (inputFile != null) {
        saveHighlights(sensorContext, sonarTSRunnerResponse.highlights, inputFile);
        saveMetrics(sensorContext, sonarTSRunnerResponse, inputFile);
        saveCpd(sensorContext, sonarTSRunnerResponse.cpdTokens, inputFile);
      } else {
        LOG.error("Failed to find input file for path `" + sonarTSRunnerResponse.filepath + "`");
      }
    }
  }

  private static SonarTSRunnerResponse[] executeExternalRunner(Command command, Iterable<InputFile> inputFiles, File typescriptLocation) {
    List<String> commandComponents = decomposeToComponents(command);
    String commandLine = command.toCommandLine();
    ProcessBuilder processBuilder = new ProcessBuilder(commandComponents);
    setNodePath(typescriptLocation, processBuilder);
    processBuilder.redirectError(ProcessBuilder.Redirect.INHERIT);
    String[] filepaths = Iterables.toArray(Iterables.transform(inputFiles, InputFile::absolutePath), String.class);
    LOG.debug(String.format("Starting external process `%s` with %d files", commandLine, filepaths.length));
    InputStreamReader inputStreamReader;
    try {
      Process process = processBuilder.start();
      OutputStreamWriter writerToSonar = new OutputStreamWriter(process.getOutputStream(), StandardCharsets.UTF_8);
      SonarTSRequest requestToRunner = new SonarTSRequest(filepaths);
      String json = new Gson().toJson(requestToRunner);
      writerToSonar.write(json);
      writerToSonar.close();

      inputStreamReader = new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8);

    } catch (Exception e) {
      throw new IllegalStateException(String.format("Failed to run external process `%s`. Run with -X for more information", commandLine), e);
    }

    SonarTSRunnerResponse[] responses = new Gson().fromJson(inputStreamReader, SonarTSRunnerResponse[].class);
    if (responses == null) {
      LOG.error(String.format("External process `%s` returned an empty output. Run with -X for more information", commandLine));

      return new SonarTSRunnerResponse[0];
    }
    return responses;

  }

  private static void setNodePath(@Nullable File typescriptLocation, ProcessBuilder processBuilder) {
    if (typescriptLocation != null) {
      Map<String, String> environment = processBuilder.environment();
      LOG.info("Setting 'NODE_PATH' to " + typescriptLocation);
      environment.put("NODE_PATH", typescriptLocation.getAbsolutePath());
    }
  }

  private void saveCpd(SensorContext sensorContext, CpdToken[] cpdTokens, InputFile file) {
    NewCpdTokens newCpdTokens = sensorContext.newCpdTokens().onFile(file);
    for (CpdToken cpdToken : cpdTokens) {
      newCpdTokens.addToken(cpdToken.startLine, cpdToken.startCol, cpdToken.endLine, cpdToken.endCol, cpdToken.image);
    }

    newCpdTokens.save();
  }

  private void saveMetrics(SensorContext sensorContext, SonarTSRunnerResponse sonarTSRunnerResponse, InputFile inputFile) {
    saveMetric(sensorContext, inputFile, CoreMetrics.FUNCTIONS, sonarTSRunnerResponse.functions);
    saveMetric(sensorContext, inputFile, CoreMetrics.CLASSES, sonarTSRunnerResponse.classes);
    saveMetric(sensorContext, inputFile, CoreMetrics.STATEMENTS, sonarTSRunnerResponse.statements);
    saveMetric(sensorContext, inputFile, CoreMetrics.NCLOC, sonarTSRunnerResponse.ncloc.length);
    saveMetric(sensorContext, inputFile, CoreMetrics.COMMENT_LINES, sonarTSRunnerResponse.commentLines.length);

    noSonarFilter.noSonarInFile(inputFile, Sets.newHashSet(sonarTSRunnerResponse.nosonarLines));

    FileLinesContext fileLinesContext = fileLinesContextFactory.createFor(inputFile);
    for (int line : sonarTSRunnerResponse.ncloc) {
      fileLinesContext.setIntValue(CoreMetrics.NCLOC_DATA_KEY, line, 1);
    }

    for (int line : sonarTSRunnerResponse.commentLines) {
      fileLinesContext.setIntValue(CoreMetrics.COMMENT_LINES_DATA_KEY, line, 1);
    }

    for (int line : sonarTSRunnerResponse.executableLines) {
      fileLinesContext.setIntValue(CoreMetrics.EXECUTABLE_LINES_DATA_KEY, line, 1);
    }

    fileLinesContext.save();
  }

  private static void saveMetric(SensorContext sensorContext, InputFile inputFile, Metric<Integer> metric, int value) {
    sensorContext.<Integer>newMeasure().forMetric(metric).on(inputFile).withValue(value).save();
  }

  private static List<String> decomposeToComponents(Command sonarCommand) {
    List<String> commandComponents = new ArrayList<>();
    commandComponents.add(sonarCommand.getExecutable());
    sonarCommand.getArguments().forEach(commandComponents::add);
    return commandComponents;
  }

  private void saveFailures(SensorContext sensorContext, Failure[] failures, TypeScriptRules typeScriptRules) {
    FileSystem fs = sensorContext.fileSystem();
    for (Failure failure : failures) {
      InputFile inputFile = fs.inputFile(fs.predicates().hasAbsolutePath(failure.name));
      if (inputFile != null) {
        RuleKey ruleKey = typeScriptRules.ruleKeyFromTsLintKey(failure.ruleName);
        NewIssue issue = sensorContext.newIssue().forRule(ruleKey);
        NewIssueLocation location = issue.newLocation();
        location.on(inputFile);
        location.message(failure.failure);

        // semicolon rule
        if (ruleKey.rule().equals("S1438")) {
          location.at(inputFile.selectLine(failure.startPosition.line + 1));

        } else if (!TypeScriptRules.FILE_LEVEL_RULES.contains(ruleKey.rule())) {
          location.at(inputFile.newRange(
            failure.startPosition.line + 1,
            failure.startPosition.character,
            failure.endPosition.line + 1,
            failure.endPosition.character));
        }

        issue.at(location);
        issue.save();
      }
    }
  }

  private void saveHighlights(SensorContext sensorContext, Highlight[] highlights, InputFile inputFile) {
    NewHighlighting highlighting = sensorContext.newHighlighting().onFile(inputFile);
    for (Highlight highlight : highlights) {
      highlighting.highlight(highlight.startLine, highlight.startCol, highlight.endLine, highlight.endCol,
        TypeOfText.valueOf(highlight.textType.toUpperCase(Locale.ENGLISH)));
    }
    highlighting.save();
  }


  @Nullable
  private static File getTypescriptLocation(File currentDirectory) {
    File nodeModules = getChildDirectoryByName(currentDirectory, "node_modules");
    if (nodeModules != null && getChildDirectoryByName(nodeModules, "typescript") != null) {
      return nodeModules;
    }

    for (File file : currentDirectory.listFiles()) {
      if (file.isDirectory()) {
        File typescriptLocationForNestedDir = getTypescriptLocation(file);
        if (typescriptLocationForNestedDir != null) {
          return typescriptLocationForNestedDir;
        }
      }
    }

    return null;
  }

  @Nullable
  private static File getChildDirectoryByName(File directory, String name) {
    for (File file : directory.listFiles()) {
      if (file.isDirectory() && file.getName().equals(name)) {
        return file;
      }
    }

    return null;
  }

  private static class Failure {

    String failure;
    Position startPosition;
    Position endPosition;
    String name;
    String ruleName;
  }
  private static class Position {

    Integer line;
    Integer character;
  }
  private static class SonarTSRunnerResponse {

    String filepath;
    Failure[] issues;
    Highlight[] highlights;
    CpdToken[] cpdTokens;
    int[] ncloc;
    int[] commentLines;
    Integer[] nosonarLines;
    int[] executableLines;
    int functions;
    int statements;
    int classes;
  }

  private static class Highlight {
    Integer startLine;
    Integer startCol;
    Integer endLine;
    Integer endCol;
    String textType;
  }

  private static class CpdToken {
    Integer startLine;
    Integer startCol;
    Integer endLine;
    Integer endCol;
    String image;
  }

  private static class SonarTSRequest {
    final String[] filepaths;

    SonarTSRequest(String[] filepaths) {
      this.filepaths = filepaths;
    }
  }
}
