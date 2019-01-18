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
package org.sonar.plugin.typescript.lcov;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.annotation.CheckForNull;
import org.sonar.api.batch.fs.InputFile;
import org.sonar.api.batch.sensor.SensorContext;
import org.sonar.api.batch.sensor.coverage.CoverageType;
import org.sonar.api.batch.sensor.coverage.NewCoverage;
import org.sonar.api.utils.log.Logger;
import org.sonar.api.utils.log.Loggers;

/**
 * http://ltp.sourceforge.net/coverage/lcov/geninfo.1.php
 */
public final class LCOVParser {

  private static final String SF = "SF:";
  private static final String DA = "DA:";
  private static final String BRDA = "BRDA:";

  private final SensorContext context;
  private final List<String> unresolvedPaths = new ArrayList<>();
  private int inconsistenciesCounter = 0;

  private static final Logger LOG = Loggers.get(LCOVParser.class);

  public LCOVParser(SensorContext context) {
    this.context = context;
  }

  public void parseReportsAndSaveCoverage(List<File> files) {
    final List<String> lines = new LinkedList<>();

    for (File file : files) {
      try (Stream<String> fileLines = Files.lines(file.toPath())) {
        lines.addAll(fileLines.collect(Collectors.toList()));

      } catch (IOException e) {
        throw new IllegalArgumentException("Could not read content from file: " + file, e);
      }
    }
    this.parse(lines);
  }

  List<String> unresolvedPaths() {
    return unresolvedPaths;
  }

  int inconsistenciesNumber() {
    return inconsistenciesCounter;
  }

  private void parse(List<String> lines) {
    final Map<InputFile, FileData> files = new HashMap<>();
    FileData fileData = null;
    int reportLineNum = 0;

    for (String line : lines) {
      reportLineNum++;
      if (line.startsWith(SF)) {
        fileData = loadCurrentFileData(files, line);

      } else if (fileData != null) {
        if (line.startsWith(DA)) {
          parseLineCoverage(fileData, reportLineNum, line);

        } else if (line.startsWith(BRDA)) {
          parseBranchCoverage(fileData, reportLineNum, line);
        }
      }

    }

    for (Map.Entry<InputFile, FileData> e : files.entrySet()) {
      NewCoverage newCoverage = context.newCoverage().onFile(e.getKey());
      e.getValue().save(newCoverage);
    }
  }

  private void parseBranchCoverage(FileData fileData, int reportLineNum, String line) {
    try {
      // BRDA:<line number>,<block number>,<branch number>,<taken>
      String[] tokens = line.substring(BRDA.length()).trim().split(",");
      String lineNumber = tokens[0];
      String branchNumber = tokens[1] + tokens[2];
      String taken = tokens[3];

      fileData.addBranch(Integer.valueOf(lineNumber), branchNumber, "-".equals(taken) ? 0 : Integer.valueOf(taken));
    } catch (Exception e) {
      logWrongDataWarning("BRDA", reportLineNum, e);
    }
  }

  private void parseLineCoverage(FileData fileData, int reportLineNum, String line) {
    try {
      // DA:<line number>,<execution count>[,<checksum>]
      String execution = line.substring(DA.length());
      String executionCount = execution.substring(execution.indexOf(',') + 1);
      String lineNumber = execution.substring(0, execution.indexOf(','));

      fileData.addLine(Integer.valueOf(lineNumber), Integer.valueOf(executionCount));
    } catch (Exception e) {
      logWrongDataWarning("DA", reportLineNum, e);
    }
  }

  private void logWrongDataWarning(String dataType, int reportLineNum, Exception e) {
    LOG.debug(String.format("Problem during processing LCOV report: can't save %s data for line %s of coverage report file (%s).", dataType, reportLineNum, e.toString()));
    inconsistenciesCounter++;
  }

  @CheckForNull
  private FileData loadCurrentFileData(final Map<InputFile, FileData> files, String line) {
    // SF:<absolute path to the source file>
    String filePath = line.substring(SF.length());
    FileData fileData = null;
    // some tools (like Istanbul, Karma) provide relative paths, so let's consider them relative to project directory
    InputFile inputFile = context.fileSystem().inputFile(context.fileSystem().predicates().hasPath(filePath));
    if (inputFile != null) {
      fileData = files.get(inputFile);
      if (fileData == null) {
        fileData = new FileData(inputFile);
        files.put(inputFile, fileData);
      }
    } else {
      unresolvedPaths.add(filePath);
    }
    return fileData;
  }

  private static class FileData {
    /**
     * line number -> branch number -> taken
     */
    private Map<Integer, Map<String, Integer>> branches = new HashMap<>();

    /**
     * line number -> execution count
     */
    private Map<Integer, Integer> hits = new HashMap<>();

    /**
     * Number of lines in the file
     * Required to check if line exist in a file, see {@link #checkLine(Integer)}
     */
    private final int linesInFile;

    private final String filename;
    private static final String WRONG_LINE_EXCEPTION_MESSAGE = "Line with number %s doesn't belong to file %s";

    FileData(InputFile inputFile) {
      linesInFile = inputFile.lines();
      filename = inputFile.relativePath();
    }

    void addBranch(Integer lineNumber, String branchNumber, Integer taken) {
      checkLine(lineNumber);

      Map<String, Integer> branchesForLine = branches.get(lineNumber);
      if (branchesForLine == null) {
        branchesForLine = new HashMap<>();
        branches.put(lineNumber, branchesForLine);
      }
      Integer currentValue = branchesForLine.get(branchNumber);
      branchesForLine.put(branchNumber, Optional.ofNullable(currentValue).orElse(0) + taken);
    }

    void addLine(Integer lineNumber, Integer executionCount) {
      checkLine(lineNumber);

      Integer currentValue = hits.get(lineNumber);
      hits.put(lineNumber, Optional.ofNullable(currentValue).orElse(0) + executionCount);
    }

    void save(NewCoverage newCoverage) {
      for (Map.Entry<Integer, Integer> e : hits.entrySet()) {
        newCoverage.lineHits(e.getKey(), e.getValue());
      }
      for (Map.Entry<Integer, Map<String, Integer>> e : branches.entrySet()) {
        int conditions = e.getValue().size();
        int covered = 0;
        for (Integer taken : e.getValue().values()) {
          if (taken > 0) {
            covered++;
          }
        }

        newCoverage.conditions(e.getKey(), conditions, covered);
      }

      // "ofType(CoverageType.UNIT)" is required for SQ < 6.2
      newCoverage.ofType(CoverageType.UNIT).save();
    }

    private void checkLine(Integer lineNumber) {
      if (lineNumber < 1 || lineNumber > linesInFile) {
        throw new IllegalArgumentException(String.format(WRONG_LINE_EXCEPTION_MESSAGE, lineNumber, filename));
      }
    }

  }

}
