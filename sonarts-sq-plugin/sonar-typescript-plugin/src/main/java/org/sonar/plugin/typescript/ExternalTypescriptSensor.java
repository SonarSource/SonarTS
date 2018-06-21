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
package org.sonar.plugin.typescript;

import com.google.gson.Gson;
import java.io.File;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import javax.annotation.Nullable;
import org.apache.commons.io.IOUtils;
import org.sonar.api.batch.fs.FileSystem;
import org.sonar.api.batch.fs.InputFile;
import org.sonar.api.batch.rule.CheckFactory;
import org.sonar.api.batch.sensor.Sensor;
import org.sonar.api.batch.sensor.SensorContext;
import org.sonar.api.batch.sensor.SensorDescriptor;
import org.sonar.api.batch.sensor.cpd.NewCpdTokens;
import org.sonar.api.batch.sensor.highlighting.NewHighlighting;
import org.sonar.api.batch.sensor.highlighting.TypeOfText;
import org.sonar.api.batch.sensor.symbol.NewSymbol;
import org.sonar.api.batch.sensor.symbol.NewSymbolTable;
import org.sonar.api.issue.NoSonarFilter;
import org.sonar.api.measures.CoreMetrics;
import org.sonar.api.measures.FileLinesContext;
import org.sonar.api.measures.FileLinesContextFactory;
import org.sonar.api.measures.Metric;
import org.sonar.api.utils.log.Logger;
import org.sonar.api.utils.log.Loggers;
import org.sonar.plugin.typescript.executable.ExecutableBundle;
import org.sonar.plugin.typescript.executable.ExecutableBundleFactory;
import org.sonar.plugin.typescript.executable.SonarTSCommand;

import static org.sonar.plugin.typescript.SensorContextUtils.setNodePath;

public class ExternalTypescriptSensor implements Sensor {

  private static final Logger LOG = Loggers.get(ExternalTypescriptSensor.class);
  private static final int MIN_NODE_VERSION = 6;
  private static final String DEFAULT_TSCONFIG = "DEFAULT_TSCONFIG";

  private final CheckFactory checkFactory;
  private final ExternalProcessStreamConsumer errorConsumer;
  private final ExecutableBundleFactory executableBundleFactory;
  private final NoSonarFilter noSonarFilter;
  private final FileLinesContextFactory fileLinesContextFactory;

  /**
   * ExecutableBundleFactory is injected for testability purposes
   */
  public ExternalTypescriptSensor(
    ExecutableBundleFactory executableBundleFactory, NoSonarFilter noSonarFilter, FileLinesContextFactory fileLinesContextFactory,
    CheckFactory checkFactory, ExternalProcessStreamConsumer errorConsumer) {
    this.executableBundleFactory = executableBundleFactory;
    this.noSonarFilter = noSonarFilter;
    this.fileLinesContextFactory = fileLinesContextFactory;
    this.checkFactory = checkFactory;
    this.errorConsumer = errorConsumer;
  }

  @Override
  public void describe(SensorDescriptor sensorDescriptor) {
    sensorDescriptor.onlyOnLanguage(TypeScriptLanguage.KEY).name("SonarTS").onlyOnFileType(InputFile.Type.MAIN);
  }

  @Override
  public void execute(SensorContext sensorContext) {
    File deployDestination = sensorContext.fileSystem().workDir();
    File typescriptLocation = getTypescriptLocation(sensorContext.fileSystem().baseDir());
    if (typescriptLocation != null) {
      LOG.debug("TypeScript compiler is found in this directory " + typescriptLocation.getAbsolutePath());
      LOG.debug("It will be used for analysis of typescript files");
    } else {
      LOG.debug("No TypeScript compiler found in your project");
      LOG.debug("Global one referenced in 'NODE_PATH' will be used");
    }

    ExecutableBundle executableBundle = executableBundleFactory.createAndDeploy(deployDestination, sensorContext.config());

    Iterable<InputFile> inputFiles = SensorContextUtils.getInputFiles(sensorContext);

    TypeScriptRules typeScriptRules = new TypeScriptRules(checkFactory);
    analyze(inputFiles, sensorContext, typeScriptRules, executableBundle, typescriptLocation);
  }

  private void analyze(
    Iterable<InputFile> inputFiles, SensorContext sensorContext, TypeScriptRules typeScriptRules, ExecutableBundle executableBundle, @Nullable File localTypescript) {

    checkCompatibleNodeVersion(executableBundle.getNodeExecutable());

    File projectBaseDir = sensorContext.fileSystem().baseDir();
    Optional<String> tsconfigPathFromVariable = sensorContext.config().get(TypeScriptPlugin.TSCONFIG_PATH);
    Map<String, List<InputFile>> inputFileByTsconfig;
    if (tsconfigPathFromVariable.isPresent()){
      inputFileByTsconfig = new HashMap<>();
      File tsconfigFile = new File(projectBaseDir+"/"+tsconfigPathFromVariable.get());
      List<InputFile> inputFileList = StreamSupport.stream(inputFiles.spliterator(), false).collect(Collectors.toList());
      inputFileByTsconfig.put(tsconfigFile.getAbsolutePath(),inputFileList);
    } else {
      inputFileByTsconfig = getInputFileByTsconfig(inputFiles, projectBaseDir);
    }


    for (Map.Entry<String, List<InputFile>> e : inputFileByTsconfig.entrySet()) {
      String tsconfigPath = e.getKey();
      Collection<InputFile> inputFilesForThisConfig = e.getValue();
      LOG.info(String.format("Analyzing %s typescript file(s) with the following configuration file %s", inputFilesForThisConfig.size(), tsconfigPath));

      SonarTSCommand command = executableBundle.getSonarTsRunnerCommand();
      String request = executableBundle.getRequestForRunner(tsconfigPath, inputFilesForThisConfig, typeScriptRules, projectBaseDir.getAbsolutePath());
      SensorContextUtils.AnalysisResponse[] responses = executeExternalRunner(command, localTypescript, request);

      for (SensorContextUtils.AnalysisResponse response : responses) {
        FileSystem fileSystem = sensorContext.fileSystem();
        InputFile inputFile = fileSystem.inputFile(fileSystem.predicates().hasAbsolutePath(response.filepath));
        if (inputFile == null) {
          LOG.error("Failed to find input file for path `" + response.filepath + "`");
          break;
        }
        if (response.hasDiagnostics()) {
          SensorContextUtils.reportAnalysisErrors(sensorContext, response, inputFile);
        } else {
          saveHighlights(sensorContext, response.highlights, inputFile);
          saveSymbols(sensorContext, response.symbols, inputFile);
          saveMetrics(sensorContext, response, inputFile);
          saveCpd(sensorContext, response.cpdTokens, inputFile);
          SensorContextUtils.saveIssues(sensorContext, response.issues, typeScriptRules);
        }
      }
    }
  }

  private static void checkCompatibleNodeVersion(String nodeExecutable) {
    LOG.debug("Checking node version");
    String messageSuffix = "No TypeScript files will be analyzed. You can exclude TypeScript files from analysis with 'sonar.exclusions' property.";

    String version;
    try {
      Process process = Runtime.getRuntime().exec(nodeExecutable + " -v");
      version = IOUtils.toString(process.getInputStream(), StandardCharsets.UTF_8).trim();
    } catch (Exception e) {
      String message = "Failed to get Node.js version." + messageSuffix;
      LOG.error(message, e);
      throw new IllegalStateException(message, e);
    }

    Pattern versionPattern = Pattern.compile("v?(\\d+)\\.\\d+\\.\\d+");
    Matcher versionMatcher = versionPattern.matcher(version);
    if (versionMatcher.matches()) {
      int major = Integer.parseInt(versionMatcher.group(1));
      if (major < MIN_NODE_VERSION) {
        String message = String.format("Only Node.js v%s or later is supported, got %s. %s", MIN_NODE_VERSION, version, messageSuffix);
        LOG.error(message);
        throw new IllegalStateException(message);
      }
    } else {
      String message = String.format("Failed to parse Node.js version, got '%s'. %s", version, messageSuffix);
      LOG.error(message);
      throw new IllegalStateException(message);
    }

    LOG.debug(String.format("Using Node.js %s", version));
  }

  private static Map<String, List<InputFile>> getInputFileByTsconfig(Iterable<InputFile> inputFiles, File projectBaseDir) {
    Map<String, List<InputFile>> inputFileByTsconfig = new HashMap<>();
    for (InputFile inputFile : inputFiles) {
      File tsConfig = findTsConfig(inputFile, projectBaseDir);
      if (tsConfig == null) {
        String message = "No tsconfig.json file found for [%s] (looking up the directories tree until project base directory [%s]). Using default configuration.";
        LOG.debug(String.format(message, inputFile.uri(), projectBaseDir.getAbsolutePath()));
        inputFileByTsconfig.computeIfAbsent(DEFAULT_TSCONFIG, x -> new ArrayList<>()).add(inputFile);
      } else {
        inputFileByTsconfig.computeIfAbsent(tsConfig.getAbsolutePath(), x -> new ArrayList<>()).add(inputFile);
      }
    }
    List<InputFile> filesWithoutTsconfig = inputFileByTsconfig.get(DEFAULT_TSCONFIG);
    if (filesWithoutTsconfig != null) {
      String message = "No tsconfig.json file found for %d file(s) (Run in debug mode to see all of them). They will be analyzed with a default configuration.";
      LOG.info(String.format(message, filesWithoutTsconfig.size()));
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

  private SensorContextUtils.AnalysisResponse[] executeExternalRunner(SonarTSCommand command, @Nullable File localTypescript, String request) {
    String commandLine = command.commandLine();
    ProcessBuilder processBuilder = new ProcessBuilder(command.commandLineTokens());

    if (localTypescript != null) {
      LOG.debug("Setting 'NODE_PATH' to " + localTypescript);
      setNodePath(localTypescript, processBuilder);
    }

    LOG.debug(String.format("Starting external process `%s`", commandLine));
    try {
      Process process = processBuilder.start();
      errorConsumer.consumeStream(process.getErrorStream(), new DetectMissingTypescript());
      OutputStreamWriter writerToSonar = new OutputStreamWriter(process.getOutputStream(), StandardCharsets.UTF_8);
      writerToSonar.write(request);
      writerToSonar.close();
      try (InputStreamReader inputStreamReader = new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8)) {
        SensorContextUtils.AnalysisResponse[] responses = new Gson().fromJson(inputStreamReader, SensorContextUtils.AnalysisResponse[].class);
        if (responses == null) {
          LOG.error(String.format("External process `%s` returned an empty output. Run with -X for more information", commandLine));
          return new SensorContextUtils.AnalysisResponse[0];
        }
        return responses;
      }

    } catch (Exception e) {
      throw new IllegalStateException(String.format("Failed to run external process `%s`. Run with -X for more information", commandLine), e);
    }

  }

  private static void saveCpd(SensorContext sensorContext, SensorContextUtils.CpdToken[] cpdTokens, InputFile file) {
    NewCpdTokens newCpdTokens = sensorContext.newCpdTokens().onFile(file);
    for (SensorContextUtils.CpdToken cpdToken : cpdTokens) {
      newCpdTokens.addToken(cpdToken.startLine, cpdToken.startCol, cpdToken.endLine, cpdToken.endCol, cpdToken.image);
    }

    newCpdTokens.save();
  }

  private void saveMetrics(SensorContext sensorContext, SensorContextUtils.AnalysisResponse analysisResponse, InputFile inputFile) {
    saveMetric(sensorContext, inputFile, CoreMetrics.FUNCTIONS, analysisResponse.functions);
    saveMetric(sensorContext, inputFile, CoreMetrics.CLASSES, analysisResponse.classes);
    saveMetric(sensorContext, inputFile, CoreMetrics.STATEMENTS, analysisResponse.statements);
    saveMetric(sensorContext, inputFile, CoreMetrics.NCLOC, analysisResponse.ncloc.length);
    saveMetric(sensorContext, inputFile, CoreMetrics.COMMENT_LINES, analysisResponse.commentLines.length);
    saveMetric(sensorContext, inputFile, CoreMetrics.COMPLEXITY, analysisResponse.complexity);
    saveMetric(sensorContext, inputFile, CoreMetrics.COGNITIVE_COMPLEXITY, analysisResponse.cognitiveComplexity);

    noSonarFilter.noSonarInFile(inputFile, Arrays.stream(analysisResponse.nosonarLines).collect(Collectors.toSet()));

    FileLinesContext fileLinesContext = fileLinesContextFactory.createFor(inputFile);
    for (int line : analysisResponse.ncloc) {
      fileLinesContext.setIntValue(CoreMetrics.NCLOC_DATA_KEY, line, 1);
    }

    for (int line : analysisResponse.executableLines) {
      fileLinesContext.setIntValue(CoreMetrics.EXECUTABLE_LINES_DATA_KEY, line, 1);
    }

    fileLinesContext.save();
  }

  private static void saveMetric(SensorContext sensorContext, InputFile inputFile, Metric<Integer> metric, int value) {
    sensorContext.<Integer>newMeasure().forMetric(metric).on(inputFile).withValue(value).save();
  }

  private static void saveHighlights(SensorContext sensorContext, SensorContextUtils.Highlight[] highlights, InputFile inputFile) {
    NewHighlighting highlighting = sensorContext.newHighlighting().onFile(inputFile);
    for (SensorContextUtils.Highlight highlight : highlights) {
      highlighting.highlight(highlight.startLine, highlight.startCol, highlight.endLine, highlight.endCol,
        TypeOfText.valueOf(highlight.textType.toUpperCase(Locale.ENGLISH)));
    }
    highlighting.save();
  }

  private static void saveSymbols(SensorContext sensorContext, SensorContextUtils.Symbol[] symbols, InputFile inputFile) {
    NewSymbolTable newSymbolTable = sensorContext.newSymbolTable().onFile(inputFile);
    for (SensorContextUtils.Symbol symbol : symbols) {
      NewSymbol newSymbol = newSymbolTable.newSymbol(symbol.startLine, symbol.startCol, symbol.endLine, symbol.endCol);
      for (SensorContextUtils.SymbolReference reference : symbol.references) {
        newSymbol.newReference(reference.startLine, reference.startCol, reference.endLine, reference.endCol);
      }
    }
    newSymbolTable.save();
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

  private static class DetectMissingTypescript implements ExternalProcessStreamConsumer.StreamConsumer {

    boolean tsNotFound;

    @Override
    public void consumeLine(String line) {
      if (line.contains("Error: Cannot find module 'typescript'")) {
        tsNotFound = true;
      }

      if (line.contains("files analyzed out of")) {
        LOG.info(line);
      } else {
        LOG.error(line);
      }
    }

    @Override
    public void finished() {
      if (tsNotFound) {
        LOG.error("Failed to find 'typescript' module. Please check, NODE_PATH contains location of global 'typescript' or install locally in your project");
      }
    }
  }
}
