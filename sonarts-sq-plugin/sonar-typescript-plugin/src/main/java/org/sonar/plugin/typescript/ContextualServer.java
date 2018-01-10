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
import org.sonar.api.utils.log.Logger;
import org.sonar.api.utils.log.Loggers;
import org.sonar.plugin.typescript.executable.ExecutableBundle;
import org.sonar.plugin.typescript.executable.ExecutableBundleFactory;
import org.sonarsource.api.sonarlint.SonarLintSide;

@InstantiationStrategy(InstantiationStrategy.PER_BATCH)
@SonarLintSide
public class ContextualServer implements Startable {

  // SonarLint should pass in this property an absolute path to the directory containing TypeScript dependency
  private static final String TYPESCRIPT_DEPENDENCY_LOCATION_PROPERTY = "sonar.typescript.internal.typescriptLocation";

  private static final Logger LOG = Loggers.get(ContextualServer.class);

  private Configuration configuration;
  private ExecutableBundleFactory bundleFactory;
  private static AtomicReference<Process> serverProcess = new AtomicReference<>();

  public ContextualServer(ExecutableBundleFactory bundleFactory) {
    this(null, bundleFactory);
  }

  public ContextualServer(Configuration configuration, ExecutableBundleFactory bundleFactory) {
    this.configuration = configuration;
    this.bundleFactory = bundleFactory;
  }

  @Override
  public void start() {
    if (serverProcess.get() != null && serverProcess.get().isAlive()) {
      LOG.debug("Skipping SonarTS Server start, already running");
      return;
    }

    LOG.warn("Attempting SonarTS Server start");

    if (configuration == null) {
      LOG.warn("Skipping SonarTS Server start due to null configuration");
      return;
    }

    final ExecutableBundle bundle = bundleFactory.createAndDeploy(getServerDir(), configuration);
    ProcessBuilder processBuilder = new ProcessBuilder(bundle.getSonarTSServerCommand().commandLineTokens());

    Optional<String> typescriptLocation = configuration.get(TYPESCRIPT_DEPENDENCY_LOCATION_PROPERTY);
    if (typescriptLocation.isPresent()) {
      SensorContextUtils.setNodePath(new File(typescriptLocation.get()), processBuilder);

    } else {
      LOG.error("No value provided by SonarLint for TypeScript location; property " + TYPESCRIPT_DEPENDENCY_LOCATION_PROPERTY);
    }

    try {
      processBuilder.inheritIO();
      serverProcess.set(processBuilder.start());
      LOG.info("SonarTS Server started");

    } catch (IOException e) {
      LOG.error("Failed to start SonarTS Server", e);
    }
  }

  private static File getServerDir() {
    File serverFolder = new File(System.getProperty("java.io.tmpdir"), "sonarts");
    if (!serverFolder.exists()) {
      serverFolder.mkdir();
    }
    return serverFolder;
  }

  @Override
  public void stop() {
    // TODO actually stop the server once this object will get instantiated by a long-lived container
  }
}
