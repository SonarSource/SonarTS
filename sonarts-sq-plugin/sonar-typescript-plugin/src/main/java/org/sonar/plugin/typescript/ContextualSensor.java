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

import java.io.IOException;
import org.sonar.api.batch.InstantiationStrategy;
import org.sonar.api.batch.fs.InputFile;
import org.sonar.api.batch.rule.CheckFactory;
import org.sonar.api.batch.sensor.Sensor;
import org.sonar.api.batch.sensor.SensorContext;
import org.sonar.api.batch.sensor.SensorDescriptor;
import org.sonar.api.utils.log.Logger;
import org.sonar.api.utils.log.Loggers;
import org.sonar.plugin.typescript.SensorContextUtils.ContextualAnalysisRequest;
import org.sonarsource.api.sonarlint.SonarLintSide;

import static org.sonar.plugin.typescript.SensorContextUtils.getInputFiles;

@InstantiationStrategy(InstantiationStrategy.PER_BATCH)
@SonarLintSide
public class ContextualSensor implements Sensor {

  private static final Logger LOG = Loggers.get(ContextualSensor.class);

  private final ContextualServer contextualServer;
  private final CheckFactory checkFactory;

  public ContextualSensor(CheckFactory checkFactory, ContextualServer contextualServer) {
    this.checkFactory = checkFactory;
    this.contextualServer = contextualServer;
  }

  @Override
  public void describe(SensorDescriptor sensorDescriptor) {
    sensorDescriptor.onlyOnLanguage(TypeScriptLanguage.KEY).name("Contextual SonarTS").onlyOnFileType(InputFile.Type.MAIN);
  }

  @Override
  public void execute(SensorContext sensorContext) {
    Iterable<InputFile> inputFiles = getInputFiles(sensorContext);
    LOG.info("Started SonarTS Analysis");
    inputFiles.forEach(inputFile -> {
      if (!inputFile.uri().getScheme().equals("file")) {
        LOG.error("File with uri [" + inputFile.uri() + "] can not be analyzed as it's not file scheme.");
        return;
      }

      try {
        TypeScriptRules typeScriptRules = new TypeScriptRules(checkFactory);
        ContextualAnalysisRequest request = new ContextualAnalysisRequest(inputFile, typeScriptRules);
        SensorContextUtils.AnalysisResponse response = contextualServer.analyze(request);
        for (SensorContextUtils.Issue issue : response.issues) {
          SensorContextUtils.saveIssue(sensorContext, typeScriptRules, issue, inputFile);
        }
      } catch (IOException e) {
        LOG.error("Failed writing to SonarTS Server ", e);
      }
    });
    LOG.info("Finished SonarTS Analysis");
  }
}
