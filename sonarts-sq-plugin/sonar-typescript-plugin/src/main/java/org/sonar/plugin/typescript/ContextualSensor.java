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

import com.google.gson.Gson;
import com.google.gson.stream.JsonReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;
import org.sonar.api.batch.ScannerSide;
import org.sonar.api.batch.fs.InputFile;
import org.sonar.api.batch.rule.CheckFactory;
import org.sonar.api.batch.sensor.Sensor;
import org.sonar.api.batch.sensor.SensorContext;
import org.sonar.api.batch.sensor.SensorDescriptor;
import org.sonar.api.utils.log.Logger;
import org.sonar.api.utils.log.Loggers;

import static org.sonar.plugin.typescript.SensorContextUtils.getInputFiles;

@ScannerSide
public class ContextualSensor implements Sensor {

  private static final Logger LOG = Loggers.get(ContextualSensor.class);

  private CheckFactory checkFactory;
  private static AtomicReference<Socket> socketReference = new AtomicReference<>();

  public ContextualSensor(CheckFactory checkFactory) {
    this.checkFactory = checkFactory;
  }

  @Override
  public void describe(SensorDescriptor sensorDescriptor) {
    sensorDescriptor.onlyOnLanguage(TypeScriptLanguage.KEY).name("Contextual SonarTS").onlyOnFileType(InputFile.Type.MAIN);
  }

  @Override
  public void execute(SensorContext sensorContext) {
    Iterable<InputFile> inputFiles = getInputFiles(sensorContext);
    inputFiles.forEach(inputFile ->
      connect().ifPresent(socket -> {
        try {
          final OutputStreamWriter writer = new OutputStreamWriter(socket.getOutputStream(), StandardCharsets.UTF_8);
          writer.append(new Gson().toJson(new SensorContextUtils.AnalysisRequest(inputFile.uri().toString(), inputFile.contents())));
          writer.flush();
          JsonReader jsonReader = new JsonReader(new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
          SensorContextUtils.AnalysisResponse response = new Gson().fromJson(jsonReader, SensorContextUtils.AnalysisResponse.class);
          TypeScriptRules typeScriptRules = new TypeScriptRules(checkFactory);
          SensorContextUtils.saveIssues(sensorContext, response.issues, typeScriptRules);
        } catch (IOException e) {
          LOG.error("Failed writing to SonarTS Server " + socket.getLocalAddress(), e);
        }
      }));
  }

  private static Optional<Socket> connect() {
    return Optional.ofNullable(socketReference.updateAndGet(socket -> {
      if (socket == null) {
        try {
          return new Socket("localhost", 55555);
        } catch (IOException e) {
          LOG.error("Failed to connect to SonarTS Server", e);
          return null;
        }
      }
      return socket;
    }));
  }

}
