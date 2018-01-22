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
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import org.apache.commons.io.IOUtils;
import org.sonar.api.Startable;
import org.sonar.api.batch.InstantiationStrategy;
import org.sonar.api.config.Configuration;
import org.sonar.api.utils.TempFolder;
import org.sonar.api.utils.log.Logger;
import org.sonar.api.utils.log.Loggers;
import org.sonar.plugin.typescript.executable.ExecutableBundle;
import org.sonar.plugin.typescript.executable.ExecutableBundleFactory;
import org.sonarsource.api.sonarlint.SonarLintSide;

@InstantiationStrategy("PER_PROCESS")
@SonarLintSide
public class ContextualServer implements Startable {

  // SonarLint should pass in this property an absolute path to the directory containing TypeScript dependency
  private static final String TYPESCRIPT_DEPENDENCY_LOCATION_PROPERTY = "sonar.typescript.internal.typescriptLocation";

  private static final Logger LOG = Loggers.get(ContextualServer.class);
  private static final Gson GSON = new Gson();

  private final Configuration configuration;
  private final ExecutableBundleFactory bundleFactory;
  private final TempFolder tempFolder;

  private Process serverProcess;
  private ServerSocket serverSocket;
  private Socket socket;

  public ContextualServer(Configuration configuration, ExecutableBundleFactory bundleFactory, TempFolder tempFolder) {
    this.configuration = configuration;
    this.bundleFactory = bundleFactory;
    this.tempFolder = tempFolder;
  }

  @Override
  public void start() {
    LOG.info("Starting SonarTS Server");

    if (isAlive()) {
      LOG.warn("Skipping SonarTS Server start, already running");
      return;
    }

    startSonarTSServer();
  }

  synchronized SensorContextUtils.AnalysisResponse analyze(SensorContextUtils.ContextualAnalysisRequest request) throws IOException {
    final OutputStreamWriter writer = new OutputStreamWriter(socket.getOutputStream(), StandardCharsets.UTF_8);
    String requestJson = GSON.toJson(request);
    writer.append(requestJson);
    writer.flush();
    JsonReader jsonReader = new JsonReader(new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
    return GSON.fromJson(jsonReader, SensorContextUtils.AnalysisResponse.class);
  }

  private void startSonarTSServer() {
    ExecutableBundle bundle = bundleFactory.createAndDeploy(tempFolder.newDir(), configuration);
    try {
      serverSocket = new ServerSocket(0);
      serverSocket.setSoTimeout(5_000);
      ProcessBuilder processBuilder = new ProcessBuilder(bundle.getSonarTSServerCommand(serverSocket.getLocalPort()).commandLineTokens());
      setNodePath(processBuilder);
      serverProcess = processBuilder.start();
      socket = serverSocket.accept();
      LOG.info("SonarTS Server is started");
    } catch (IOException e) {
      LOG.error("Failed to start SonarTS Server", e);
      if (isAlive()) {
        terminate();
      }
    }
  }

  private void setNodePath(ProcessBuilder processBuilder) {
    Optional<String> typescriptLocation = configuration.get(TYPESCRIPT_DEPENDENCY_LOCATION_PROPERTY);
    if (typescriptLocation.isPresent()) {
      SensorContextUtils.setNodePath(new File(typescriptLocation.get()), processBuilder);
    } else {
      LOG.warn("No value provided by SonarLint for TypeScript location; property " + TYPESCRIPT_DEPENDENCY_LOCATION_PROPERTY + " is missing");
    }
  }

  @Override
  public void stop() {
    if (isAlive()) {
      terminate();
      LOG.info("SonarTS Server is stopped");
    } else {
      LOG.warn("SonarTS Server was already stopped");
    }
  }

  private void terminate() {
    try {
      IOUtils.closeQuietly(socket);
      IOUtils.closeQuietly(serverSocket);
      serverProcess.destroy();
      boolean terminated = serverProcess.waitFor(200, TimeUnit.MILLISECONDS);
      if (!terminated) {
        serverProcess.destroyForcibly();
      }
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
    }
  }

  boolean isAlive() {
    return serverProcess != null && serverProcess.isAlive();
  }
}
