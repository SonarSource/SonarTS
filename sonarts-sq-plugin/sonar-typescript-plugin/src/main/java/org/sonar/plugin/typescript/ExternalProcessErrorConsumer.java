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

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.sonar.api.batch.BatchSide;
import org.sonar.api.batch.ScannerSide;
import org.sonar.api.utils.log.Logger;
import org.sonar.api.utils.log.Loggers;
import org.sonarsource.api.sonarlint.SonarLintSide;

@BatchSide
@ScannerSide
@SonarLintSide
public class ExternalProcessErrorConsumer {

  // Available to subclasses
  protected static final Logger LOG = Loggers.get(ExternalProcessErrorConsumer.class);

  public final void consumeStdError(Process process) {
    final ExecutorService errorConsumer = Executors.newSingleThreadExecutor();
    errorConsumer.submit(() -> {
      try (BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
        readErrors(errorReader);
      } catch (IOException e) {
        LOG.error("Error while reading error stream", e);
      }
    });
  }

  protected void readErrors(BufferedReader errorReader) {
    errorReader.lines().forEach(LOG::error);
  }
}
