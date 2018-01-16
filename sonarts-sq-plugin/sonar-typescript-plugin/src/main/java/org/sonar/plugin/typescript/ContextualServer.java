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

import java.io.File;
import java.io.IOException;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;
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

  private final Configuration configuration;
  private final ExecutableBundleFactory bundleFactory;
  private final TempFolder tempFolder;

  private static AtomicReference<Process> serverProcess = new AtomicReference<>();

  public ContextualServer(Configuration configuration, ExecutableBundleFactory bundleFactory, TempFolder tempFolder) {
    this.configuration = configuration;
    this.bundleFactory = bundleFactory;
    this.tempFolder = tempFolder;
  }

  @Override
  public void start() {
    LOG.info("Starting SonarTS Server");

    if (serverProcess.get() != null && serverProcess.get().isAlive()) {
      LOG.warn("Skipping SonarTS Server start, already running");
      return;
    }

    if (configuration == null) {
      LOG.warn("Skipping SonarTS Server start due to missing configuration");
      return;
    }

    startSonarTSServer();
  }

  private void startSonarTSServer() {
    ExecutableBundle bundle = bundleFactory.createAndDeploy(tempFolder.newDir(), configuration);

    ProcessBuilder processBuilder = new ProcessBuilder(bundle.getSonarTSServerCommand().commandLineTokens());
    setNodePath(processBuilder);

    try {
      processBuilder.inheritIO();
      serverProcess.set(processBuilder.start());
      // TODO find a better way to wait until the server is up
      // e.g. loop with accessing the port
      synchronized (this) {
        wait(1000);
      }
      LOG.info("SonarTS Server is started");

    } catch (IOException e) {
      LOG.error("Failed to start SonarTS Server", e);

    } catch (InterruptedException e) {
      LOG.error("Failed to wait until the SonarTS Server is up", e);
      throw new RuntimeException(e);
    }
  }

  private void setNodePath(ProcessBuilder processBuilder) {
    Optional<String> typescriptLocation = configuration.get(TYPESCRIPT_DEPENDENCY_LOCATION_PROPERTY);

    if (typescriptLocation.isPresent()) {
      SensorContextUtils.setNodePath(new File(typescriptLocation.get()), processBuilder);

    } else {
      LOG.error("No value provided by SonarLint for TypeScript location; property " + TYPESCRIPT_DEPENDENCY_LOCATION_PROPERTY + " is missing");
    }
  }

  @Override
  public void stop() {
    Process process = serverProcess.get();
    if (process != null && process.isAlive()) {

      process.destroy();
      synchronized (this) {
        try {
          wait(200);
        } catch (InterruptedException e) {
          LOG.error("Failed to wait until the SonarTS Server is stopped", e);
          throw new RuntimeException(e);
        }
      }

      if (process.isAlive()) {
        process.destroyForcibly();
      }

      LOG.info("SonarTS Server is stopped");

    } else {
      LOG.warn("Failed to stop SonarTS Server");
    }
  }
}
